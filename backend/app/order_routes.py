from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Order, OrderItem, Product
from app.schemas import OrderCreate, OrderResponse
from app.security import get_current_admin
from app.email_service import send_shipping_email
from datetime import datetime, timezone
import smtplib
from sqlalchemy import update

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


class TrackingCodeUpdate(BaseModel):
    tracking_code: str = Field(min_length=5, max_length=100)

# =========================================================
# CRIAR PEDIDO
# =========================================================

@router.post("/", response_model=OrderResponse)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db)
):
    if not order_data.items:
        raise HTTPException(
            status_code=400,
            detail="O pedido precisa ter pelo menos um produto"
        )

    total = Decimal("0.00")
    order_items = []

    has_physical_items = False

    # -----------------------------------------------------
    # VALIDA OS PRODUTOS DO PEDIDO
    # -----------------------------------------------------

    for item_data in order_data.items:
        if item_data.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="A quantidade deve ser maior que zero"
            )

        product = (
            db.query(Product)
            .filter(Product.id == item_data.product_id)
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Produto {item_data.product_id} "
                    "não encontrado"
                )
            )

        if product.product_type == "physical":
            has_physical_items = True

        # Aqui apenas verificamos se existe estoque.
        # O estoque NÃO é descontado neste momento.
        if product.stock < item_data.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente para {product.name}"
            )

        subtotal = product.price * item_data.quantity
        total += subtotal

        order_items.append({
            "product": product,
            "quantity": item_data.quantity,
            "unit_price": product.price
        })

    # -----------------------------------------------------
    # FRETE
    # -----------------------------------------------------

    shipping_price = Decimal("0.00")

    if has_physical_items:
        if order_data.shipping_service_id is None:
            raise HTTPException(
                status_code=400,
                detail="Selecione uma opção de frete para continuar"
            )

        if order_data.shipping_price <= 0:
            raise HTTPException(
                status_code=400,
                detail="O valor do frete é inválido"
            )

        shipping_price = order_data.shipping_price

    total += shipping_price

    # -----------------------------------------------------
    # CRIA O PEDIDO
    # -----------------------------------------------------

    new_order = Order(
        customer_name=order_data.customer_name,
        customer_email=order_data.customer_email,
        customer_phone=order_data.customer_phone,
        customer_document=order_data.customer_document,

        shipping_cep=order_data.shipping_cep,
        shipping_state=order_data.shipping_state,
        shipping_city=order_data.shipping_city,
        shipping_street=order_data.shipping_street,
        shipping_number=order_data.shipping_number,
        shipping_complement=order_data.shipping_complement,
        shipping_district=order_data.shipping_district,

        shipping_service_id=order_data.shipping_service_id,
        shipping_service_name=order_data.shipping_service_name,
        shipping_company=order_data.shipping_company,
        shipping_price=shipping_price,
        shipping_delivery_min=order_data.shipping_delivery_min,
        shipping_delivery_max=order_data.shipping_delivery_max,

        total=total
    )

    db.add(new_order)
    db.flush()

    # -----------------------------------------------------
    # CRIA OS ITENS DO PEDIDO
    # -----------------------------------------------------

    for item in order_items:
        new_item = OrderItem(
            order_id=new_order.id,
            product_id=item["product"].id,
            quantity=item["quantity"],
            unit_price=item["unit_price"]
        )

        db.add(new_item)

    # IMPORTANTE:
    # Não diminuímos product.stock aqui.
    # A baixa será feita somente quando o webhook
    # confirmar que o pagamento foi aprovado.

    db.commit()
    db.refresh(new_order)

    return new_order


# =========================================================
# LISTAR PEDIDOS - ADMIN
# =========================================================

@router.get("/", response_model=list[OrderResponse])
def list_orders(
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin)
):
    return (
        db.query(Order)
        .order_by(Order.id.desc())
        .all()
    )

# =========================================================
# MARCAR PEDIDO COMO ENVIADO - ADMIN
# =========================================================

@router.patch("/{order_id}/ship", response_model=OrderResponse)
def mark_order_as_shipped(
    order_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin)
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .with_for_update()
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Pedido não encontrado."
        )

    if order.payment_status != "paid":
        raise HTTPException(
            status_code=400,
            detail="Somente pedidos pagos podem ser marcados como enviados."
        )

    if not order.melhor_envio_generate_key:
        raise HTTPException(
            status_code=400,
            detail="É necessário solicitar a geração da etiqueta antes de marcar como enviado."
        )

    if not order.tracking_code or not order.tracking_code.strip():
        raise HTTPException(
            status_code=400,
            detail="É necessário ter um código de rastreamento antes de marcar o pedido como enviado."
        )

    if order.shipping_email_status == "sent" or order.shipping_email_sent_at is not None:
        return order

    if order.shipping_email_status == "sending":
        raise HTTPException(
            status_code=409,
            detail="A notificação deste pedido já foi iniciada. Verifique o envio antes de tentar novamente."
        )
    if order.status == "delivered":
        raise HTTPException(
            status_code=400,
            detail="Este pedido já está marcado como entregue."
        )
    result = db.execute(
        update(Order)
        .where(
            Order.id == order_id,
            Order.shipping_email_status == "pending",
            Order.shipping_email_sent_at.is_(None)
        )
        .values(
            status="shipped",
            shipping_email_status="sending"
        )
    )

    if result.rowcount != 1:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A notificação não está disponível para envio. Verifique o status antes de tentar novamente."
        )

    db.commit()
    db.refresh(order)

    try:
        send_shipping_email(
            customer_email=order.customer_email,
            customer_name=order.customer_name,
            order_id=order.id,
            tracking_code=order.tracking_code,
            shipping_company=order.shipping_company or "Transportadora"
        )

    except (smtplib.SMTPException, OSError) as error:
        db.rollback()

        raise HTTPException(
            status_code=502,
            detail=(
                "Não foi possível confirmar o envio do e-mail. "
                "A notificação ficou pendente de verificação manual. "
                "Não tente reenviar antes de conferir."
            )
        ) from error

    except Exception:
        db.rollback()
        raise

    order.shipping_email_sent_at = datetime.now(timezone.utc)
    order.shipping_email_status = "sent"

    try:
        db.commit()
        db.refresh(order)
    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Ocorreu um erro inesperado durante a tentativa de envio. "
                "A notificação foi bloqueada por segurança. "
                "Verifique se o cliente recebeu o e-mail antes de tentar novamente."
            )
        ) from error

    return order

# =========================================================
# ATUALIZAR CÓDIGO DE RASTREAMENTO - ADMIN
# =========================================================

@router.patch("/{order_id}/tracking", response_model=OrderResponse)
def update_tracking_code(
    order_id: int,
    data: TrackingCodeUpdate,
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin)
):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Pedido não encontrado."
        )

    if order.payment_status != "paid":
        raise HTTPException(
            status_code=400,
            detail="O pedido precisa estar pago."
        )

    if order.status == "delivered":
        raise HTTPException(
            status_code=400,
            detail="Não é possível alterar o rastreamento de um pedido entregue."
        )

    tracking_code = data.tracking_code.strip().upper()

    if len(tracking_code) < 5:
        raise HTTPException(
            status_code=400,
            detail="Código de rastreamento inválido."
        )

    order.tracking_code = tracking_code

    db.commit()
    db.refresh(order)

    return order


# =========================================================
# MARCAR PEDIDO COMO ENTREGUE - ADMIN
# =========================================================

@router.patch("/{order_id}/deliver", response_model=OrderResponse)
def mark_order_as_delivered(
    order_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin)
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .with_for_update()
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Pedido não encontrado."
        )

    if order.status == "delivered":
        return order

    if order.status != "shipped":
        raise HTTPException(
            status_code=400,
            detail="Somente pedidos enviados podem ser marcados como entregues."
        )

    order.status = "delivered"

    db.commit()
    db.refresh(order)

    return order


# =========================================================
# CANCELAR PEDIDO NÃO PAGO - ADMIN
# =========================================================

@router.patch("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin)
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .with_for_update()
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Pedido não encontrado."
        )

    if order.status == "cancelled":
        return order

    if order.payment_status == "paid":
        raise HTTPException(
            status_code=400,
            detail="Pedidos pagos precisam passar pelo processo de estorno."
        )

    if order.status in ("shipped", "delivered"):
        raise HTTPException(
            status_code=400,
            detail="Não é possível cancelar um pedido enviado ou entregue."
        )

    if order.melhor_envio_order_id or order.melhor_envio_purchase_id:
        raise HTTPException(
            status_code=400,
            detail="Verifique ou cancele primeiro a operação de frete no Melhor Envio."
        )

    order.status = "cancelled"

    db.commit()
    db.refresh(order)

    return order
