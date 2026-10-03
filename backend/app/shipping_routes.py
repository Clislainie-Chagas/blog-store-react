import os
import requests

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from urllib.parse import urlencode

from app.database import get_db
from app.models import MelhorEnvioToken
from pydantic import BaseModel, Field


load_dotenv()

MELHOR_ENVIO_CLIENT_ID = os.getenv("MELHOR_ENVIO_CLIENT_ID")
MELHOR_ENVIO_CLIENT_SECRET = os.getenv("MELHOR_ENVIO_CLIENT_SECRET")
MELHOR_ENVIO_REDIRECT_URI = os.getenv("MELHOR_ENVIO_REDIRECT_URI")
MELHOR_ENVIO_BASE_URL = os.getenv("MELHOR_ENVIO_BASE_URL")
MELHOR_ENVIO_ORIGIN_CEP = os.getenv("MELHOR_ENVIO_ORIGIN_CEP")
MELHOR_ENVIO_USER_AGENT_EMAIL = os.getenv("MELHOR_ENVIO_USER_AGENT_EMAIL")


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
        "scope": "shipping-calculate",
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