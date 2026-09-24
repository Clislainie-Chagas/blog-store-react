from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ContactMessage
from app.security import get_current_admin


router = APIRouter(
    prefix="/contact",
    tags=["Contact"],
)


class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("/")
def create_contact_message(
    contact: ContactMessageCreate,
    db: Session = Depends(get_db),
):
    new_message = ContactMessage(
        name=contact.name,
        email=contact.email,
        subject=contact.subject,
        message=contact.message,
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return {
        "message": "Mensagem enviada com sucesso!",
        "id": new_message.id,
    }

@router.get("/admin/messages")
def get_contact_messages(
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin),
):
    messages = (
        db.query(ContactMessage)
        .order_by(ContactMessage.created_at.desc())
        .all()
    )

    return messages