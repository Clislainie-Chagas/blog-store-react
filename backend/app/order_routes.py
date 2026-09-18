from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Order, OrderItem, Product
from app.schemas import OrderCreate, OrderResponse
from app.security import get_current_admin

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

    for item_data in order_data.items:
        if item_data.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="A quantidade deve ser maior que zero"
            )

        product = db.query(Product).filter(
            Product.id == item_data.product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Produto {item_data.product_id} não encontrado"
            )

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

    new_order = Order(
        customer_name=order_data.customer_name,
        customer_email=order_data.customer_email,
        customer_phone=order_data.customer_phone,

        shipping_cep=order_data.shipping_cep,
        shipping_state=order_data.shipping_state,
        shipping_city=order_data.shipping_city,
        shipping_street=order_data.shipping_street,
        shipping_number=order_data.shipping_number,

        total=total
    )

    db.add(new_order)
    db.flush()

    for item in order_items:
        new_item = OrderItem(
            order_id=new_order.id,
            product_id=item["product"].id,
            quantity=item["quantity"],
            unit_price=item["unit_price"]
        )

        item["product"].stock -= item["quantity"]

        db.add(new_item)

    db.commit()
    db.refresh(new_order)

    return new_order

@router.get("/", response_model=list[OrderResponse])
def list_orders(
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin)
):
    return db.query(Order).order_by(Order.id.desc()).all()    