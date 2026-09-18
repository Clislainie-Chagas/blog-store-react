from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(150), nullable=False)
    customer_email = Column(String(255), nullable=False)

    customer_phone = Column(String(30), nullable=True)

    shipping_cep = Column(String(10), nullable=True)
    shipping_state = Column(String(2), nullable=True)
    shipping_city = Column(String(150), nullable=True)
    shipping_street = Column(String(255), nullable=True)
    shipping_number = Column(String(30), nullable=True) 

    total = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    payment_status = Column(String(50), nullable=False, default="pending")

    payment_method = Column(
        String(50),
        nullable=True
    )

    payment_provider = Column(
        String(50),
        nullable=True
    )

    payment_reference = Column(
        String(255),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(
        Integer,
        ForeignKey("orders.id"),
        nullable=False
    )
    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)

    order = relationship(
        "Order",
        back_populates="items"
    )

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    image = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    stock = Column(Integer, nullable=False, default=0)

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

