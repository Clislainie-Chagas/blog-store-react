from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)

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
    shipping_complement = Column(String(150), nullable=True)

    shipping_service_id = Column(Integer, nullable=True)
    shipping_service_name = Column(String(100), nullable=True)
    shipping_company = Column(String(100), nullable=True)
    shipping_price = Column(
        Numeric(10, 2),
        nullable=False,
        default=0
    )
    shipping_delivery_min = Column(Integer, nullable=True)
    shipping_delivery_max = Column(Integer, nullable=True)

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

    product = relationship("Product")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    product_type = Column(String(50), nullable=False, default="physical")
    price = Column(Numeric(10, 2), nullable=False)
    image = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    stock = Column(Integer, nullable=False, default=0)
    weight = Column(Numeric(10, 3), nullable=True)
    length = Column(Numeric(10, 2), nullable=True)
    width = Column(Numeric(10, 2), nullable=True)
    height = Column(Numeric(10, 2), nullable=True)

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(120), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)

    is_read = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

class MelhorEnvioToken(Base):
    __tablename__ = "melhor_envio_tokens"

    id = Column(Integer, primary_key=True, index=True)

    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=False)
    token_type = Column(String(50), nullable=False, default="Bearer")
    expires_in = Column(Integer, nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)
    slug = Column(String(220), unique=True, index=True, nullable=False)

    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)

    category = Column(String(100), nullable=False)
    image_url = Column(String(500), nullable=True)

    published = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )