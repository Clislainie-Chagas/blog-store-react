from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Admin

from app.schemas import AdminCreate, AdminLogin, AdminResponse
from app.security import ( hash_password, verify_password, get_current_admin,)
from app.jwt import create_access_token



router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# @router.post("/register", response_model=AdminResponse)
# def register_admin(
#     admin_data: AdminCreate,
#     db: Session = Depends(get_db)
# ):
#     existing_admin = db.query(Admin).filter(
#         Admin.email == admin_data.email
#     ).first()

#     if existing_admin:
#         raise HTTPException(
#             status_code=400,
#             detail="E-mail já cadastrado"
#         )

#     new_admin = Admin(
#         name=admin_data.name,
#         email=admin_data.email,
#         password_hash=hash_password(
#             admin_data.password
#         )
#     )

#     db.add(new_admin)
#     db.commit()
#     db.refresh(new_admin)

#     return new_admin

@router.post("/login")
def login_admin(
    login_data: AdminLogin,
    db: Session = Depends(get_db)
):
    admin = db.query(Admin).filter(
        Admin.email == login_data.email
    ).first()

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha inválidos"
        )

    password_is_valid = verify_password(
        login_data.password,
        admin.password_hash
    )

    if not password_is_valid:
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha inválidos"
        )

    access_token = create_access_token(admin.id)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me")
def get_admin_profile(
    admin_id: int = Depends(get_current_admin)
):
    return {
        "message": "Token válido",
        "admin_id": admin_id
    }