import os
import requests

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from urllib.parse import urlencode

from app.database import get_db
from app.models import MelhorEnvioToken, Order, Product
from app.security import get_current_admin

from pydantic import BaseModel, Field


load_dotenv()

MELHOR_ENVIO_CLIENT_ID = os.getenv("MELHOR_ENVIO_CLIENT_ID")
MELHOR_ENVIO_CLIENT_SECRET = os.getenv("MELHOR_ENVIO_CLIENT_SECRET")
MELHOR_ENVIO_REDIRECT_URI = os.getenv("MELHOR_ENVIO_REDIRECT_URI")
MELHOR_ENVIO_BASE_URL = os.getenv("MELHOR_ENVIO_BASE_URL")
MELHOR_ENVIO_ORIGIN_CEP = os.getenv("MELHOR_ENVIO_ORIGIN_CEP")
MELHOR_ENVIO_USER_AGENT_EMAIL = os.getenv("MELHOR_ENVIO_USER_AGENT_EMAIL")

MELHOR_ENVIO_SENDER_NAME = os.getenv("MELHOR_ENVIO_SENDER_NAME")
MELHOR_ENVIO_SENDER_PHONE = os.getenv("MELHOR_ENVIO_SENDER_PHONE")
MELHOR_ENVIO_SENDER_EMAIL = os.getenv("MELHOR_ENVIO_SENDER_EMAIL")
MELHOR_ENVIO_SENDER_DOCUMENT = os.getenv("MELHOR_ENVIO_SENDER_DOCUMENT")
MELHOR_ENVIO_SENDER_ADDRESS = os.getenv("MELHOR_ENVIO_SENDER_ADDRESS")
MELHOR_ENVIO_SENDER_NUMBER = os.getenv("MELHOR_ENVIO_SENDER_NUMBER")
MELHOR_ENVIO_SENDER_COMPLEMENT = os.getenv("MELHOR_ENVIO_SENDER_COMPLEMENT")
MELHOR_ENVIO_SENDER_DISTRICT = os.getenv("MELHOR_ENVIO_SENDER_DISTRICT")
MELHOR_ENVIO_SENDER_CITY = os.getenv("MELHOR_ENVIO_SENDER_CITY")
MELHOR_ENVIO_SENDER_STATE = os.getenv("MELHOR_ENVIO_SENDER_STATE")

class ShippingQuoteRequest(BaseModel):
    destination_cep: str
    weight: float = Field(gt=0)
    width: float = Field(gt=0)
    height: float = Field(gt=0)
    length: float = Field(gt=0)
    insurance_value: float = Field(default=0, ge=0)

router = APIRouter(
    prefix="/shipping",
    tags=["Shipping"],
)

class ShippingCartRequest(BaseModel):
    order_id: int

class ShippingCheckoutRequest(BaseModel):
    order_id: int

class ShippingGenerateRequest(BaseModel):
    order_id: int

@router.get("/authorize")
def authorize_melhor_envio():
    if not MELHOR_ENVIO_CLIENT_ID or not MELHOR_ENVIO_REDIRECT_URI:
        return {
            "error": "Credenciais do Melhor Envio não configuradas"
        }

    params = {
        "client_id": MELHOR_ENVIO_CLIENT_ID,
        "redirect_uri": MELHOR_ENVIO_REDIRECT_URI,
        "response_type": "code",
        "scope": (
            "shipping-calculate "
            "cart-read "
            "cart-write "
            "shipping-checkout "
            "shipping-generate "
            "shipping-print "
            "orders-read"
        ),
    }

    authorization_url = (
        f"{MELHOR_ENVIO_BASE_URL}/oauth/authorize?"
        + urlencode(params)
    )

    return RedirectResponse(url=authorization_url)

@router.get("/callback")
def shipping_callback(
    code: str,
    db: Session = Depends(get_db)
):
    token_url = f"{MELHOR_ENVIO_BASE_URL}/oauth/token"

    data = {
        "grant_type": "authorization_code",
        "client_id": MELHOR_ENVIO_CLIENT_ID,
        "client_secret": MELHOR_ENVIO_CLIENT_SECRET,
        "redirect_uri": MELHOR_ENVIO_REDIRECT_URI,
        "code": code,
    }

    response = requests.post(
        token_url,
        data=data,
        headers={
            "Accept": "application/json",
        },
        timeout=30,
    )

    if not response.ok:
        return {
            "error": "Não foi possível obter o token do Melhor Envio",
            "status_code": response.status_code,
            "details": response.text,
        }

    token_data = response.json()

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    token_type = token_data.get("token_type", "Bearer")
    expires_in = token_data.get("expires_in")

    if not access_token or not refresh_token or not expires_in:
        return {
            "error": "O Melhor Envio não retornou todos os tokens esperados."
        }

    # Mantemos apenas uma autorização ativa do Melhor Envio.
    saved_token = db.query(MelhorEnvioToken).first()

    if saved_token:
        saved_token.access_token = access_token
        saved_token.refresh_token = refresh_token
        saved_token.token_type = token_type
        saved_token.expires_in = expires_in
    else:
        saved_token = MelhorEnvioToken(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=token_type,
            expires_in=expires_in,
        )

        db.add(saved_token)

    db.commit()

    return {
        "message": "Melhor Envio autorizado e token salvo com sucesso",
        "token_type": token_type,
        "expires_in": expires_in,
    }

@router.post("/quote")
def calculate_shipping(
    quote: ShippingQuoteRequest,
    db: Session = Depends(get_db)
):
    saved_token = db.query(MelhorEnvioToken).first()

    if not saved_token:
        raise HTTPException(
            status_code=401,
            detail="Melhor Envio ainda não foi autorizado."
        )

    if not MELHOR_ENVIO_ORIGIN_CEP:
        raise HTTPException(
            status_code=500,
            detail="CEP de origem não configurado."
        )

    destination_cep = "".join(
        filter(str.isdigit, quote.destination_cep)
    )

    if len(destination_cep) != 8:
        raise HTTPException(
            status_code=400,
            detail="CEP de destino inválido."
        )

    url = f"{MELHOR_ENVIO_BASE_URL}/api/v2/me/shipment/calculate"

    payload = {
        "services": "1,2",
        "from": {
            "postal_code": MELHOR_ENVIO_ORIGIN_CEP
        },
        "to": {
            "postal_code": destination_cep
        },
        "package": {
            "height": quote.height,
            "width": quote.width,
            "length": quote.length,
            "weight": quote.weight
        },
        "options": {
            "insurance_value": quote.insurance_value,
            "receipt": False,
            "own_hand": False
        }
    }

    headers = {
        "Authorization": f"Bearer {saved_token.access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": (
            f"Arte da Magia ({MELHOR_ENVIO_USER_AGENT_EMAIL})"
        ),
    }

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=30,
        )
    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível conectar ao Melhor Envio."
        )

    if not response.ok:
        raise HTTPException(
            status_code=response.status_code,
            detail={
                "message": "Erro ao calcular o frete.",
                "melhor_envio": response.text,
            },
        )

    shipping_options = response.json()

    formatted_options = []

    for option in shipping_options:
        # Algumas opções podem retornar erro ou ficar indisponíveis
        if option.get("error"):
            continue

        company = option.get("company") or {}

        delivery_range = option.get("delivery_range") or {}

        formatted_options.append({
            "id": option.get("id"),
            "name": option.get("name"),
            "company": company.get("name"),
            "price": float(option.get("custom_price") or option.get("price") or 0),
            "delivery_time": option.get("delivery_time"),
            "delivery_min": delivery_range.get("min"),
            "delivery_max": delivery_range.get("max"),
        })

    return formatted_options

@router.post("/cart")
def add_shipping_to_cart(
    data: ShippingCartRequest,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    order = (
        db.query(Order)
        .filter(Order.id == data.order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Pedido não encontrado."
        )

    if order.melhor_envio_order_id:
        return {
            "message": "Este pedido já foi inserido no carrinho do Melhor Envio.",
            "order_id": order.id,
            "melhor_envio_order_id": order.melhor_envio_order_id,
        }

    if order.payment_status != "paid":
        raise HTTPException(
            status_code=400,
            detail="O frete só pode ser gerado para um pedido pago."
        )

    if not order.customer_document:
        raise HTTPException(
            status_code=400,
            detail="O pedido não possui CPF do destinatário."
        )

    if not order.shipping_district:
        raise HTTPException(
            status_code=400,
            detail="O pedido não possui bairro do destinatário."
        )

    required_shipping_fields = {
    "CEP": order.shipping_cep,
    "Estado": order.shipping_state,
    "Cidade": order.shipping_city,
    "Rua": order.shipping_street,
    "Número": order.shipping_number,
}

    missing_fields = [
        field_name
        for field_name, value in required_shipping_fields.items()
        if not value
    ]

    if missing_fields:
        raise HTTPException(
            status_code=400,
            detail=(
                "Dados de entrega incompletos: "
                + ", ".join(missing_fields)
            )
        )

    if not order.shipping_service_id:
        raise HTTPException(
            status_code=400,
            detail="O pedido não possui serviço de frete selecionado."
        )

    physical_items = [
        item
        for item in order.items
        if item.product.product_type == "physical"
    ]

    if not physical_items:
        raise HTTPException(
            status_code=400,
            detail="O pedido não possui produtos físicos."
        )

    for item in physical_items:
        product = item.product

        if (
            product.weight is None
            or product.length is None
            or product.width is None
            or product.height is None
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"O produto '{product.name}' não possui "
                    "peso ou dimensões cadastrados."
                )
            )

    products = []

    for item in physical_items:
        product = item.product

        products.append({
            "name": product.name,
            "quantity": item.quantity,
            "unitary_value": float(item.unit_price),
        })

        total_weight = sum(
        float(item.product.weight) * item.quantity
        for item in physical_items
        )

        max_length = max(
            float(item.product.length)
            for item in physical_items
        )

        max_width = max(
            float(item.product.width)
            for item in physical_items
        )

        max_height = max(
            float(item.product.height)
            for item in physical_items
        )

        volume = {
            "height": max_height,
            "width": max_width,
            "length": max_length,
            "weight": total_weight,
        }

        recipient = {
            "name": order.customer_name,
            "phone": order.customer_phone or "",
            "email": order.customer_email,
            "document": "".join(
                filter(str.isdigit, order.customer_document)
            ),
            "address": order.shipping_street,
            "complement": order.shipping_complement or "",
            "number": order.shipping_number,
            "district": order.shipping_district,
            "city": order.shipping_city,
            "state_abbr": order.shipping_state,
            "country_id": "BR",
            "postal_code": "".join(
                filter(str.isdigit, order.shipping_cep)
            ),
        }

        sender = {
            "name": MELHOR_ENVIO_SENDER_NAME,
            "phone": MELHOR_ENVIO_SENDER_PHONE,
            "email": MELHOR_ENVIO_SENDER_EMAIL,
            "document": "".join(
                filter(str.isdigit, MELHOR_ENVIO_SENDER_DOCUMENT or "")
            ),
            "address": MELHOR_ENVIO_SENDER_ADDRESS,
            "complement": MELHOR_ENVIO_SENDER_COMPLEMENT or "",
            "number": MELHOR_ENVIO_SENDER_NUMBER,
            "district": MELHOR_ENVIO_SENDER_DISTRICT,
            "city": MELHOR_ENVIO_SENDER_CITY,
            "state_abbr": MELHOR_ENVIO_SENDER_STATE,
            "country_id": "BR",
            "postal_code": "".join(
                filter(str.isdigit, MELHOR_ENVIO_ORIGIN_CEP or "")
            ),
        }

        payload = {
            "service": order.shipping_service_id,

            "from": sender,
            "to": recipient,

            "products": products,

            "volumes": [
                volume
            ],

            "options": {
                "insurance_value": float(
                    order.total - order.shipping_price
                ),
                "receipt": False,
                "own_hand": False,
                "reverse": False,
                "non_commercial": True,
            },
        }

        saved_token = db.query(MelhorEnvioToken).first()

        if not saved_token:
            raise HTTPException(
                status_code=401,
                detail="Melhor Envio ainda não foi autorizado."
            )

        headers = {
            "Authorization": f"Bearer {saved_token.access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": (
                f"Arte da Magia ({MELHOR_ENVIO_USER_AGENT_EMAIL})"
            ),
        }

        url = f"{MELHOR_ENVIO_BASE_URL}/api/v2/me/cart"

        try:
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=30,
            )
        except requests.RequestException:
            raise HTTPException(
                status_code=502,
                detail="Não foi possível conectar ao Melhor Envio."
            )

        if not response.ok:
            raise HTTPException(
                status_code=response.status_code,
                detail={
                    "message": "Erro ao inserir o frete no carrinho.",
                    "melhor_envio": response.text,
                },
            )

    melhor_envio_order = response.json()

    melhor_envio_order_id = melhor_envio_order.get("id")

    if not melhor_envio_order_id:
        raise HTTPException(
            status_code=502,
            detail="O Melhor Envio não retornou o ID do frete."
        )

    order.melhor_envio_order_id = str(melhor_envio_order_id)
    db.commit()

    return {
        "message": "Frete inserido no carrinho do Melhor Envio.",
        "order_id": order.id,
        "melhor_envio_order_id": order.melhor_envio_order_id,
}

@router.post("/checkout")
def checkout_shipping(
    data: ShippingCheckoutRequest,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    order = (
        db.query(Order)
        .filter(Order.id == data.order_id)
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
            detail="O pedido precisa estar pago."
        )

    if not order.melhor_envio_order_id:
        raise HTTPException(
            status_code=400,
            detail="O frete ainda não foi inserido no carrinho do Melhor Envio."
        )

    if order.melhor_envio_purchase_id:
        return {
            "message": "Este frete já foi comprado no Melhor Envio.",
            "order_id": order.id,
            "melhor_envio_order_id": order.melhor_envio_order_id,
            "melhor_envio_purchase_id": order.melhor_envio_purchase_id,
        }

    saved_token = db.query(MelhorEnvioToken).first()

    if not saved_token:
        raise HTTPException(
            status_code=401,
            detail="Melhor Envio ainda não foi autorizado."
        )

    headers = {
        "Authorization": f"Bearer {saved_token.access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": (
            f"Arte da Magia ({MELHOR_ENVIO_USER_AGENT_EMAIL})"
        ),
    }

    payload = {
        "orders": [
            order.melhor_envio_order_id
        ]
    }

    url = f"{MELHOR_ENVIO_BASE_URL}/api/v2/me/shipment/checkout"

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=30,
        )
    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível conectar ao Melhor Envio."
        )

    if not response.ok:
        raise HTTPException(
            status_code=response.status_code,
            detail={
                "message": "Erro ao comprar o frete no Melhor Envio.",
                "melhor_envio": response.text,
            },
        )

    checkout_result = response.json()

    purchase = checkout_result.get("purchase")
    purchase_id = purchase.get("id") if purchase else None

    if not purchase_id:
        raise HTTPException(
            status_code=502,
            detail="O Melhor Envio não retornou o ID da compra."
        )

    order.melhor_envio_purchase_id = str(purchase_id)
    db.commit()

    return {
        "message": "Frete comprado com sucesso no Melhor Envio.",
        "order_id": order.id,
        "melhor_envio_order_id": order.melhor_envio_order_id,
        "melhor_envio_purchase_id": order.melhor_envio_purchase_id,
    }

@router.post("/generate")
def generate_shipping_label(
    data: ShippingGenerateRequest,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    order = (
        db.query(Order)
        .filter(Order.id == data.order_id)
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
            detail="O pedido precisa estar pago."
        )

    if not order.melhor_envio_order_id:
        raise HTTPException(
            status_code=400,
            detail="O frete ainda não foi inserido no Melhor Envio."
        )

    if not order.melhor_envio_purchase_id:
        raise HTTPException(
            status_code=400,
            detail="O frete precisa ser comprado antes de gerar a etiqueta."
        )

    if order.melhor_envio_generate_key:
        return {
            "message": "A geração da etiqueta já foi solicitada ao Melhor Envio.",
            "order_id": order.id,
            "melhor_envio_order_id": order.melhor_envio_order_id,
            "generate_key": order.melhor_envio_generate_key,
        }

    saved_token = db.query(MelhorEnvioToken).first()

    if not saved_token:
        raise HTTPException(
            status_code=401,
            detail="Melhor Envio ainda não foi autorizado."
        )

    headers = {
        "Authorization": f"Bearer {saved_token.access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": (
            f"Arte da Magia ({MELHOR_ENVIO_USER_AGENT_EMAIL})"
        ),
    }

    payload = {
        "orders": [
            order.melhor_envio_order_id
        ]
    }

    url = f"{MELHOR_ENVIO_BASE_URL}/api/v2/me/shipment/generate"

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=30,
        )
    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível conectar ao Melhor Envio."
        )

    if not response.ok:
        raise HTTPException(
            status_code=response.status_code,
            detail={
                "message": "Erro ao gerar a etiqueta no Melhor Envio.",
                "melhor_envio": response.text,
            },
        )

    generate_result = response.json()

    generate_key = generate_result.get("generate_key")

    shipping_result = generate_result.get(
        str(order.melhor_envio_order_id), {}
    )

    if not generate_key or shipping_result.get("status") is not True:
        raise HTTPException(
            status_code=502,
            detail="O Melhor Envio não confirmou a solicitação de geração da etiqueta."
        )

    order.melhor_envio_generate_key = str(generate_key)
    db.commit()

    return {
        "message": "Geração da etiqueta solicitada com sucesso.",
        "order_id": order.id,
        "melhor_envio_order_id": order.melhor_envio_order_id,
        "generate_key": order.melhor_envio_generate_key,
    }

@router.get("/label/{order_id}")
def get_shipping_label(
    order_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Pedido não encontrado."
        )

    if not order.melhor_envio_generate_key:
        raise HTTPException(
            status_code=400,
            detail="A geração da etiqueta ainda não foi solicitada."
        )

    saved_token = db.query(MelhorEnvioToken).first()

    if not saved_token:
        raise HTTPException(
            status_code=401,
            detail="Melhor Envio ainda não foi autorizado."
        )

    headers = {
        "Authorization": f"Bearer {saved_token.access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": (
            f"Arte da Magia ({MELHOR_ENVIO_USER_AGENT_EMAIL})"
        ),
    }

    url = f"{MELHOR_ENVIO_BASE_URL}/api/v2/me/shipment/print"

    payload = {
        "orders": [
            order.melhor_envio_order_id
        ],
        "mode": "private",
    }

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=30,
        )
    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível conectar ao Melhor Envio."
        )

    if not response.ok:
        raise HTTPException(
            status_code=response.status_code,
            detail={
                "message": "Não foi possível obter a etiqueta.",
                "melhor_envio": response.text,
            },
        )

    print_result = response.json()

    return {
        "message": "Consulta de impressão realizada.",
        "order_id": order.id,
        "melhor_envio": print_result,
    }


@router.post("/tracking/{order_id}")
def get_shipping_tracking(
    order_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Pedido não encontrado."
        )

    if not order.melhor_envio_order_id:
        raise HTTPException(
            status_code=400,
            detail="Este pedido ainda não possui envio no Melhor Envio."
        )

    if not order.melhor_envio_generate_key:
        raise HTTPException(
            status_code=400,
            detail="A geração da etiqueta ainda não foi solicitada."
        )

    saved_token = db.query(MelhorEnvioToken).first()

    if not saved_token:
        raise HTTPException(
            status_code=401,
            detail="Melhor Envio ainda não foi autorizado."
        )

    headers = {
        "Authorization": f"Bearer {saved_token.access_token}",
        "Accept": "application/json",
        "User-Agent": f"Arte da Magia ({MELHOR_ENVIO_USER_AGENT_EMAIL})",
    }

    url = (
        f"{MELHOR_ENVIO_BASE_URL}/api/v2/me/orders/"
        f"{order.melhor_envio_order_id}"
    )

    try:
        response = requests.get(
            url,
            headers=headers,
            timeout=30,
        )
    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível conectar ao Melhor Envio."
        )

    if not response.ok:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Erro ao consultar a etiqueta.",
                "melhor_envio_status": response.status_code,
                "melhor_envio_response": response.text[:1000],
            },
        )

    try:
        label = response.json()
    except ValueError:
        raise HTTPException(
            status_code=502,
            detail="O Melhor Envio retornou um JSON inválido."
        )

    if not isinstance(label, dict):
        raise HTTPException(
            status_code=502,
            detail="Resposta inesperada do Melhor Envio."
        )

    if str(label.get("id")) != str(order.melhor_envio_order_id):
        raise HTTPException(
            status_code=502,
            detail="O ID da etiqueta retornada não corresponde ao pedido."
        )

    tracking_code = label.get("tracking")

    # Informações disponíveis para diagnóstico.
    # Ainda não representam confirmação de entrega.
    melhor_envio_status = label.get("status")
    melhor_envio_delivered_at = label.get("delivered_at")

    if not tracking_code:
        return {
            "message": "A etiqueta ainda não possui código de rastreamento.",
            "order_id": order.id,
            "tracking_code": None,
            "melhor_envio_status": melhor_envio_status,
            "melhor_envio_delivered_at": melhor_envio_delivered_at,
            "order_status": order.status,
        }

    # Atualiza o rastreamento somente se houver alteração.
    # Atualiza o código de rastreamento, se necessário
    if order.tracking_code != tracking_code:
        order.tracking_code = tracking_code

    # Confirma a entrega somente quando o Melhor Envio
    # informar explicitamente o status "delivered"
    if (
        melhor_envio_status == "delivered"
        and melhor_envio_delivered_at
        and order.status == "shipped"
    ):
        order.status = "delivered"

    db.commit()
    db.refresh(order)

    return {
        "message": "Consulta de rastreamento realizada com sucesso.",
        "order_id": order.id,
        "tracking_code": order.tracking_code,
        "melhor_envio_status": melhor_envio_status,
        "melhor_envio_delivered_at": melhor_envio_delivered_at,
        "order_status": order.status,
    }