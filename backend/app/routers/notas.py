from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.models.nota import Nota
from app.schemas.nota import NotaSchema, NotaBase

router = APIRouter(prefix="/notas", tags=["notas"], dependencies=[Depends(get_current_active_user)])


@router.get("/{id}", response_model=NotaSchema)
def get_nota(id: UUID, db: Session = Depends(get_db)):
    nota = db.query(Nota).filter(Nota.id == id).first()
    if not nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nota not found")
    return nota


@router.put("/{id}", response_model=NotaSchema)
def update_nota(id: UUID, nota_in: NotaBase, db: Session = Depends(get_db)):
    nota = db.query(Nota).filter(Nota.id == id).first()
    if not nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nota not found")
    nota.contenido = nota_in.contenido
    db.commit()
    db.refresh(nota)
    return nota


@router.delete("/{id}")
def delete_nota(id: UUID, db: Session = Depends(get_db)):
    nota = db.query(Nota).filter(Nota.id == id).first()
    if not nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nota not found")
    db.delete(nota)
    db.commit()
    return {"ok": True}
