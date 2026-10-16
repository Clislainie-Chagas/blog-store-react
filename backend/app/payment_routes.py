import os
from decimal import Decimal

import mercadopago
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request
from mercadopago.webhook import (
    InvalidWebhookSignatureError,
    WebhookSignatureValidator,
)
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Order, Product


load_dotenv()

router = APIRouter(prefix="/payments", tags=["Payments"])


# =========================================================
# BANCO DE DADOS
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# CHECKOUT PRO
# =========================================================

@router.post("/checkout-pro/{order_id}")
def create_checkout_pro(
    order_id: int,
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Pedido não encontrado",
        )
    # Impede gerar pagamento para pedido cancelado
    if order.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Este pedido foi cancelado e não pode ser pago.",
        )
    # Bloqueia cancelamento quando já existe
    # uma preferência de pagamento no Mercado Pago.
    if (
        order.payment_provider == "mercado_pago"
        and order.payment_reference
    ):
        raise HTTPException(
            status_code=409,
            detail=(
                "Este pedido possui um pagamento iniciado "
                "no Mercado Pago. Verifique a situação "
                "do pagamento antes de cancelar."
            ),
        )


    # Impede gerar um novo pagamento para pedido já pago
    if order.payment_status == "paid":
        raise HTTPException(
            status_code=400,
            detail="Este pedido já está pago",
        )

    access_token = os.getenv(
        "MERCADO_PAGO_ACCESS_TOKEN"
    )

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )

    if not access_token:
        raise HTTPException(
            status_code=500,
            detail="Credencial do Mercado Pago não configurada",
        )

    sdk = mercadopago.SDK(access_token)

    preference_data = {
        "items": [
            {
                "title": f"Pedido #{order.id} - Arte da Magia",
                "quantity": 1,
                "unit_price": float(order.total),
                "currency_id": "BRL",
            }
        ],
        "external_reference": str(order.id),

        "back_urls": {
            "success": (
                f"{frontend_url}/payment/success/{order.id}"
            ),
            "failure": (
                f"{frontend_url}/payment/failure/{order.id}"
            ),
            "pending": (
                f"{frontend_url}/payment/pending/{order.id}"
            ),
        },
    }

    response = sdk.preference().create(
        preference_data
    )

    if response.get("status") not in [200, 201]:
        raise HTTPException(
            status_code=502,
            detail=response.get("response"),
        )

    preference = response.get(
        "response",
        {},
    )

    order.payment_provider = "mercado_pago"
    order.payment_reference = preference.get("id")
    order.payment_status = "pending"

    db.commit()
    db.refresh(order)

    return {
        "preference_id": preference.get("id"),
        "checkout_url": preference.get("init_point"),
        "sandbox_checkout_url": preference.get(
            "sandbox_init_point"
        ),
    }


# =========================================================
# WEBHOOK MERCADO PAGO
# =========================================================

@router.post("/webhook")
async def mercado_pago_webhook(
    request: Request,
    body: dict,
):
    # Ignora notificações antigas merchant_order
    topic = request.query_params.get("topic")

    if topic == "merchant_order":
        return {
            "status": "ignored",
            "reason": (
                "merchant_order não é processado "
                "por este webhook"
            ),
        }

    # -----------------------------------------------------
    # VALIDAÇÃO DA ASSINATURA DO WEBHOOK
    # -----------------------------------------------------

    webhook_secret = os.getenv(
        "MERCADO_PAGO_WEBHOOK_SECRET"
    )

    if not webhook_secret:
        raise HTTPException(
            status_code=500,
            detail=(
                "Chave secreta do webhook "
                "não configurada"
            ),
        )

    x_signature = request.headers.get(
        "x-signature"
    )

    x_request_id = request.headers.get(
        "x-request-id"
    )

    data_id = request.query_params.get(
        "data.id"
    )

    if (
        not x_signature
        or not x_request_id
        or not data_id
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Dados obrigatórios do webhook "
                "não encontrados"
            ),
        )

    try:
        WebhookSignatureValidator.validate(
            x_signature,
            x_request_id,
            data_id,
            webhook_secret,
        )

    except InvalidWebhookSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Assinatura do webhook inválida",
        )

    # -----------------------------------------------------
    # CONSULTA O PAGAMENTO NO MERCADO PAGO
    # -----------------------------------------------------

    access_token = os.getenv(
        "MERCADO_PAGO_ACCESS_TOKEN"
    )

    if not access_token:
        raise HTTPException(
            status_code=500,
            detail=(
                "Access Token do Mercado Pago "
                "não configurado"
            ),
        )

    sdk = mercadopago.SDK(access_token)

    payment_response = sdk.payment().get(
        data_id
    )

    # O simulador pode utilizar um ID fictício.
    if payment_response.get("status") != 200:
        return {
            "status": "ignored",
            "reason": (
                "Pagamento não encontrado "
                "no Mercado Pago"
            ),
        }

    payment_data = payment_response.get(
        "response",
        {},
    )

    payment_status = payment_data.get(
        "status"
    )

    external_reference = payment_data.get(
        "external_reference"
    )

    transaction_amount = payment_data.get(
        "transaction_amount"
    )

    currency_id = payment_data.get(
        "currency_id"
    )

    # -----------------------------------------------------
    # IDENTIFICA O PEDIDO
    # -----------------------------------------------------

    if not external_reference:
        return {
            "status": "ignored",
            "reason": (
                "Pagamento sem referência "
                "de pedido"
            ),
        }

    try:
        order_id = int(
            external_reference
        )

    except (ValueError, TypeError):
        return {
            "status": "ignored",
            "reason": (
                "Referência de pedido inválida"
            ),
        }

    db = SessionLocal()

    try:
        # Bloqueia a linha do pedido enquanto este
        # webhook está sendo processado.
        #
        # Isso ajuda a impedir que dois webhooks
        # simultâneos descontem o estoque duas vezes.
        order = (
            db.query(Order)
            .filter(Order.id == order_id)
            .with_for_update()
            .first()
        )

        if not order:
            return {
                "status": "ignored",
                "reason": "Pedido não encontrado",
            }
        # -------------------------------------------------
        # PROTEÇÃO PARA PEDIDOS CANCELADOS
        # -------------------------------------------------
        if order.status == "cancelled":
            return {
                "status": "ignored",
                "reason": (
                    "Pedido cancelado. "
                    "Verificar manualmente se houve pagamento "
                    "e se é necessário realizar estorno."
                ),
                "order_id": order.id,
            }

        # -------------------------------------------------
        # CONFERE MOEDA
        # -------------------------------------------------

        if currency_id != "BRL":
            return {
                "status": "ignored",
                "reason": (
                    "Moeda do pagamento inválida"
                ),
            }

        # -------------------------------------------------
        # CONFERE VALOR
        # -------------------------------------------------

        if transaction_amount is None:
            return {
                "status": "ignored",
                "reason": (
                    "Valor do pagamento não informado"
                ),
            }

        payment_amount = Decimal(
            str(transaction_amount)
        )

        if payment_amount != order.total:
            return {
                "status": "ignored",
                "reason": (
                    "Valor do pagamento "
                    "diferente do pedido"
                ),
            }

        # -------------------------------------------------
        # PAGAMENTO APROVADO
        # -------------------------------------------------

        if payment_status == "approved":

            # Só baixa o estoque quando o pedido
            # ainda NÃO estava pago.
            #
            # Se o Mercado Pago repetir o webhook,
            # essa parte não será executada novamente.
            if order.payment_status != "paid":

                # Primeiro verifica se existe estoque
                # para TODOS os itens.
                for item in order.items:

                    product = (
                        db.query(Product)
                        .filter(
                            Product.id
                            == item.product_id
                        )
                        .with_for_update()
                        .first()
                    )

                    if not product:
                        raise HTTPException(
                            status_code=500,
                            detail=(
                                f"Produto "
                                f"{item.product_id} "
                                f"não encontrado"
                            ),
                        )

                    if product.stock < item.quantity:
                        raise HTTPException(
                            status_code=409,
                            detail=(
                                "Estoque insuficiente "
                                f"para {product.name}"
                            ),
                        )

                # Depois de validar todos,
                # realiza a baixa do estoque.
                for item in order.items:

                    product = (
                        db.query(Product)
                        .filter(
                            Product.id
                            == item.product_id
                        )
                        .first()
                    )

                    product.stock -= item.quantity

                order.payment_status = "paid"

            # Se já estava pago, mantém como paid
            # sem baixar o estoque novamente.
            else:
                order.payment_status = "paid"

        # -------------------------------------------------
        # PAGAMENTO PENDENTE
        # -------------------------------------------------

        elif payment_status in [
            "pending",
            "in_process",
        ]:

            # Um webhook antigo/pending não deve
            # transformar um pedido já pago em pendente.
            if order.payment_status != "paid":
                order.payment_status = "pending"

        # -------------------------------------------------
        # PAGAMENTO RECUSADO/CANCELADO
        # -------------------------------------------------

        elif payment_status in [
            "rejected",
            "cancelled",
        ]:

            # Também não sobrescreve um pedido
            # que já foi confirmado como pago.
            if order.payment_status != "paid":
                order.payment_status = "failed"

        # -------------------------------------------------
        # OUTROS STATUS
        # -------------------------------------------------

        else:

            if order.payment_status != "paid":
                order.payment_status = (
                    payment_status or "unknown"
                )

        # -------------------------------------------------
        # MÉTODO DE PAGAMENTO
        # -------------------------------------------------

        order.payment_method = payment_data.get(
            "payment_method_id"
        )

        db.commit()
        db.refresh(order)

        updated_payment_status = (
            order.payment_status
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

    return {
        "status": "ok",
        "order_id": order_id,
        "payment_status": updated_payment_status,
    }


# =========================================================
# STATUS DO PAGAMENTO
# =========================================================

@router.get("/status/{order_id}")
def get_payment_status(
    order_id: int,
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Pedido não encontrado",
        )

    return {
        "order_id": order.id,
        "payment_status": order.payment_status,
    }