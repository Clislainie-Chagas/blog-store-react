from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Product
from app.schemas import ProductCreate, ProductResponse
from app.security import get_current_admin


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin)
):
    new_product = Product(
        name=product.name,
        category=product.category,
        price=product.price,
        image=product.image,
        description=product.description,
        stock=product.stock
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product

@router.get("/", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()

    return products

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado"
        )

    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado"
        )

    product.name = product_data.name
    product.category = product_data.category
    product.price = product_data.price
    product.image = product_data.image
    product.description = product_data.description
    product.stock = product_data.stock

    db.commit()
    db.refresh(product)

    return product

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Produto excluído com sucesso"
    }

