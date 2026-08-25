from datetime import datetime
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.models.cotizacion import Cotizacion
from app.models.oportunidad import Oportunidad
from app.models.user import User
from app.schemas.cotizacion import (
    CotizacionSchema,
    CotizacionCreate,
    CotizacionUpdate,
    PaginatedCotizaciones,
)

router = APIRouter(prefix="/cotizaciones", tags=["cotizaciones"], dependencies=[Depends(get_current_active_user)])


@router.get("/", response_model=PaginatedCotizaciones)
def list_cotizaciones(
    oportunidad_id: Optional[UUID] = Query(None),
    estado: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Cotizacion)
    if oportunidad_id:
        query = query.filter(Cotizacion.oportunidad_id == oportunidad_id)
    if estado:
        query = query.filter(Cotizacion.estado == estado)

    total = query.count()
    items = query.order_by(Cotizacion.created_at.desc()).offset((page - 1) * size).limit(size).all()
    pages = (total + size - 1) // size if size > 0 else 0

    return PaginatedCotizaciones(items=items, total=total, page=page, size=size, pages=pages)


@router.post("/", response_model=CotizacionSchema, status_code=status.HTTP_201_CREATED)
def create_cotizacion(
    cot_in: CotizacionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Verify oportunidad exists
    opp = db.query(Oportunidad).filter(Oportunidad.id == cot_in.oportunidad_id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidad not found")

    cot = Cotizacion(**cot_in.model_dump())
    db.add(cot)
    db.commit()
    db.refresh(cot)
    return cot


@router.get("/{id}", response_model=CotizacionSchema)
def get_cotizacion(id: UUID, db: Session = Depends(get_db)):
    cot = db.query(Cotizacion).filter(Cotizacion.id == id).first()
    if not cot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotizacion not found")
    return cot


@router.put("/{id}", response_model=CotizacionSchema)
def update_cotizacion(id: UUID, cot_in: CotizacionUpdate, db: Session = Depends(get_db)):
    cot = db.query(Cotizacion).filter(Cotizacion.id == id).first()
    if not cot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotizacion not found")

    update_data = cot_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cot, field, value)

    cot.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(cot)
    return cot
