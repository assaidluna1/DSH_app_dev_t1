from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.models.contacto import Contacto
from app.schemas.contacto import ContactoSchema, ContactoCreate, ContactoUpdate

router = APIRouter(prefix="/contactos", tags=["contactos"], dependencies=[Depends(get_current_active_user)])


@router.get("/", response_model=List[ContactoSchema])
def list_contactos(
    cliente_id: Optional[UUID] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Contacto)
    if cliente_id:
        query = query.filter(Contacto.cliente_id == cliente_id)
    if search:
        search_pat = f"%{search}%"
        query = query.filter(
            or_(
                Contacto.nombre.ilike(search_pat),
                Contacto.apellido.ilike(search_pat),
                Contacto.email.ilike(search_pat),
                Contacto.cargo.ilike(search_pat),
            )
        )
    return query.order_by(Contacto.nombre.asc()).all()


@router.post("/", response_model=ContactoSchema, status_code=status.HTTP_201_CREATED)
def create_contacto(contacto_in: ContactoCreate, db: Session = Depends(get_db)):
    contacto = Contacto(
        cliente_id=contacto_in.cliente_id,
        nombre=contacto_in.nombre,
        apellido=contacto_in.apellido,
        cargo=contacto_in.cargo,
        email=contacto_in.email,
        telefono=contacto_in.telefono,
        es_decision_maker=contacto_in.es_decision_maker or False,
        activo=contacto_in.activo if contacto_in.activo is not None else True,
    )
    db.add(contacto)
    db.commit()
    db.refresh(contacto)
    return contacto


@router.get("/{id}", response_model=ContactoSchema)
def get_contacto(id: UUID, db: Session = Depends(get_db)):
    contacto = db.query(Contacto).filter(Contacto.id == id).first()
    if not contacto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contacto not found")
    return contacto


@router.put("/{id}", response_model=ContactoSchema)
def update_contacto(id: UUID, contacto_in: ContactoUpdate, db: Session = Depends(get_db)):
    contacto = db.query(Contacto).filter(Contacto.id == id).first()
    if not contacto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contacto not found")

    update_data = contacto_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contacto, field, value)

    db.commit()
    db.refresh(contacto)
    return contacto


@router.delete("/{id}")
def delete_contacto(id: UUID, db: Session = Depends(get_db)):
    contacto = db.query(Contacto).filter(Contacto.id == id).first()
    if not contacto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contacto not found")
    db.delete(contacto)
    db.commit()
    return {"ok": True}
