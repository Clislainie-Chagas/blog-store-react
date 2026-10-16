import requests

from app.database import SessionLocal
from app.models import Order, MelhorEnvioToken
from app.shipping_routes import (
    MELHOR_ENVIO_BASE_URL,
    MELHOR_ENVIO_USER_AGENT_EMAIL,
)


def check_delivered_orders():
    db = SessionLocal()

    try:
        orders = (
            db.query(Order)
            .filter(Order.status == "shipped")
            .all()
        )

        print(f"Pedidos enviados encontrados: {len(orders)}")

        if not orders:
            return

        token = db.query(MelhorEnvioToken).first()

        if not token:
            print("Melhor Envio não autorizado.")
            return

        if not MELHOR_ENVIO_BASE_URL:
            print("URL do Melhor Envio não configurada.")
            return

        headers = {
            "Authorization": f"Bearer {token.access_token}",
            "Accept": "application/json",
            "User-Agent": (
                f"Arte da Magia ({MELHOR_ENVIO_USER_AGENT_EMAIL})"
            ),
        }

        for order in orders:
            if (
                not order.melhor_envio_order_id
                or not order.melhor_envio_generate_key
            ):
                continue

            try:
                url = (
                    f"{MELHOR_ENVIO_BASE_URL}/api/v2/me/orders/"
                    f"{order.melhor_envio_order_id}"
                )

                response = requests.get(
                    url,
                    headers=headers,
                    timeout=30,
                )

                if not response.ok:
                    print(
                        f"Pedido #{order.id}: erro HTTP "
                        f"{response.status_code}"
                    )
                    continue

                label = response.json()

                if not isinstance(label, dict):
                    continue

                if str(label.get("id")) != str(order.melhor_envio_order_id):
                    print(f"Pedido #{order.id}: ID da etiqueta diferente.")
                    continue

                status = label.get("status")
                delivered_at = label.get("delivered_at")

                if status == "delivered" and delivered_at:
                    order.status = "delivered"
                    db.commit()

                    print(f"Pedido #{order.id}: entrega confirmada!")
                else:
                    print(f"Pedido #{order.id}: ainda não entregue.")

            except (requests.RequestException, ValueError) as error:
                db.rollback()
                print(f"Pedido #{order.id}: erro na consulta: {error}")

    finally:
        db.close()


if __name__ == "__main__":
    check_delivered_orders()