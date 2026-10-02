import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import BlogPost
from app.schemas import BlogPostCreate, BlogPostUpdate, BlogPostResponse
from app.security import get_current_admin


router = APIRouter(
    prefix="/blog",
    tags=["Blog"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# LISTAR ARTIGOS PUBLICADOS
# =========================================================

@router.get("/", response_model=list[BlogPostResponse])
def list_published_posts(
    db: Session = Depends(get_db)
):
    return (
        db.query(BlogPost)
        .filter(BlogPost.published == True)
        .order_by(BlogPost.created_at.desc())
        .all()
    )


# =========================================================
# LISTAR TODOS OS ARTIGOS NO ADMIN
# =========================================================

@router.get(
    "/admin/posts",
    response_model=list[BlogPostResponse]
)
def list_admin_posts(
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin)
):
    return (
        db.query(BlogPost)
        .order_by(BlogPost.created_at.desc())
        .all()
    )


# =========================================================
# UPLOAD DE IMAGEM DO BLOG
# =========================================================

@router.post("/upload-image")
async def upload_blog_image(
    file: UploadFile = File(...),
    admin_id: int = Depends(get_current_admin)
):
    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    # Verifica o formato
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Formato de imagem não permitido. Use JPG, PNG ou WEBP.",
        )

    # Lê o arquivo
    content = await file.read()

    # Limite de 5 MB
    max_image_size = 5 * 1024 * 1024

    if len(content) > max_image_size:
        raise HTTPException(
            status_code=400,
            detail="A imagem deve ter no máximo 5 MB.",
        )

    # Cria um nome único para evitar arquivos com nomes repetidos
    extension = allowed_types[file.content_type]
    filename = f"{uuid.uuid4()}{extension}"

    # Pasta onde as imagens serão armazenadas
    upload_dir = "uploads/blog"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, filename)

    # Salva a imagem
    with open(file_path, "wb") as image_file:
        image_file.write(content)

    return {
        "image_url": f"/uploads/blog/{filename}"
    }


# =========================================================
# BUSCAR ARTIGO PUBLICADO PELO SLUG
# =========================================================

@router.get("/{slug}", response_model=BlogPostResponse)
def get_published_post(
    slug: str,
    db: Session = Depends(get_db)
):
    post = (
        db.query(BlogPost)
        .filter(
            BlogPost.slug == slug,
            BlogPost.published == True
        )
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Artigo não encontrado"
        )

    return post


# =========================================================
# CRIAR ARTIGO
# =========================================================

@router.post("/", response_model=BlogPostResponse)
def create_post(
    post: BlogPostCreate,
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin)
):
    existing_post = (
        db.query(BlogPost)
        .filter(BlogPost.slug == post.slug)
        .first()
    )

    if existing_post:
        raise HTTPException(
            status_code=400,
            detail="Já existe um artigo com esse slug"
        )

    new_post = BlogPost(
        title=post.title,
        slug=post.slug,
        summary=post.summary,
        content=post.content,
        category=post.category,
        image_url=post.image_url,
        published=post.published
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return new_post


# =========================================================
# ATUALIZAR ARTIGO
# =========================================================

@router.put("/{post_id}", response_model=BlogPostResponse)
def update_post(
    post_id: int,
    post_data: BlogPostUpdate,
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin)
):
    post = (
        db.query(BlogPost)
        .filter(BlogPost.id == post_id)
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Artigo não encontrado"
        )

    # Se estiver alterando o slug, verifica se já existe outro igual
    if post_data.slug is not None and post_data.slug != post.slug:
        existing_post = (
            db.query(BlogPost)
            .filter(
                BlogPost.slug == post_data.slug,
                BlogPost.id != post_id
            )
            .first()
        )

        if existing_post:
            raise HTTPException(
                status_code=400,
                detail="Já existe um artigo com esse slug"
            )

    # Atualiza somente os campos enviados
    update_data = post_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)

    return post


# =========================================================
# EXCLUIR ARTIGO
# =========================================================

@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_current_admin)
):
    post = (
        db.query(BlogPost)
        .filter(BlogPost.id == post_id)
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Artigo não encontrado"
        )

    db.delete(post)
    db.commit()

    return {
        "message": "Artigo excluído com sucesso"
    }