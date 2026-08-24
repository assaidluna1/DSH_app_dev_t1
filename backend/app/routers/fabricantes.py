from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user, require_admin
from app.models.fabricante import Fabricante
from app.schemas.fabricante import FabricanteSchema, FabricanteCreate, FabricanteUpdate

router = APIRouter(prefix="/fabricantes", tags=["fabricantes"], dependencies=[Depends(get_current_active_user)])


@router.get("/", response_model=List[FabricanteSchema])
def list_fabricantes(db: Session = Depends(get_db)):
    return db.query(Fabricante).order_by(Fabricante.nombre.asc()).all()


@router.post("/", response_model=FabricanteSchema, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_fabricante(fab_in: FabricanteCreate, db: Session = Depends(get_db)):
    existing = db.query(Fabricante).filter(Fabricante.nombre == fab_in.nombre).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Fabricante already exists")
    fab = Fabricante(
        nombre=fab_in.nombre,
        categoria=fab_in.categoria,
        logo_url=fab_in.logo_url,
        activo=fab_in.activo if fab_in.activo is not None else True,
    )
    db.add(fab)
    db.commit()
    db.refresh(fab)
    return fab


@router.get("/{id}", response_model=FabricanteSchema)
def get_fabricante(id: UUID, db: Session = Depends(get_db)):
    fab = db.query(Fabricante).filter(Fabricante.id == id).first()
    if not fab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fabricante not found")
    return fab


@router.put("/{id}", response_model=FabricanteSchema, dependencies=[Depends(require_admin)])
def update_fabricante(id: UUID, fab_in: FabricanteUpdate, db: Session = Depends(get_db)):
    fab = db.query(Fabricante).filter(Fabricante.id == id).first()
    if not fab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fabricante not found")

    if fab_in.nombre and fab_in.nombre != fab.nombre:
        existing = db.query(Fabricante).filter(Fabricante.nombre == fab_in.nombre).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Fabricante name already exists")
        fab.nombre = fab_in.nombre

    if fab_in.categoria is not None:
        fab.categoria = fab_in.categoria
    if fab_in.logo_url is not None:
        fab.logo_url = fab_in.logo_url
    if fab_in.activo is not None:
        fab.activo = fab_in.activo

    db.commit()
    db.refresh(fab)
    return fab
