import math
from datetime import datetime
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.models.actividad import Actividad
from app.models.oportunidad import Oportunidad
from app.models.user import User
from app.schemas.actividad import ActividadSchema, ActividadCreate, ActividadUpdate, PaginatedActividades

router = APIRouter(prefix="/actividades", tags=["actividades"], dependencies=[Depends(get_current_active_user)])


@router.get("/", response_model=PaginatedActividades)
def list_actividades(
    oportunidad_id: Optional[UUID] = Query(None),
    usuario_id: Optional[UUID] = Query(None),
    tipo: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Actividad)
    if oportunidad_id:
        query = query.filter(Actividad.oportunidad_id == oportunidad_id)
    if usuario_id:
        query = query.filter(Actividad.usuario_id == usuario_id)
    if tipo:
        query = query.filter(Actividad.tipo == tipo)

    total = query.count()
    pages = math.ceil(total / size) if total > 0 else 1
    items = (
        query.order_by(Actividad.fecha.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    return PaginatedActividades(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


@router.post("/", response_model=ActividadSchema, status_code=status.HTTP_201_CREATED)
def create_actividad(
    act_in: ActividadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    opp = db.query(Oportunidad).filter(Oportunidad.id == act_in.oportunidad_id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidad not found")

    act = Actividad(
        oportunidad_id=act_in.oportunidad_id,
        usuario_id=act_in.usuario_id or current_user.id,
        tipo=act_in.tipo,
        titulo=act_in.titulo,
        descripcion=act_in.descripcion,
        fecha=act_in.fecha or datetime.utcnow(),
        duracion_min=act_in.duracion_min,
        resultado=act_in.resultado,
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return act


@router.get("/{id}", response_model=ActividadSchema)
def get_actividad(id: UUID, db: Session = Depends(get_db)):
    act = db.query(Actividad).filter(Actividad.id == id).first()
    if not act:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actividad not found")
    return act


@router.put("/{id}", response_model=ActividadSchema)
def update_actividad(id: UUID, act_in: ActividadUpdate, db: Session = Depends(get_db)):
    act = db.query(Actividad).filter(Actividad.id == id).first()
    if not act:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actividad not found")

    update_data = act_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(act, field, value)

    db.commit()
    db.refresh(act)
    return act


@router.delete("/{id}")
def delete_actividad(id: UUID, db: Session = Depends(get_db)):
    act = db.query(Actividad).filter(Actividad.id == id).first()
    if not act:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actividad not found")
    db.delete(act)
    db.commit()
    return {"ok": True}
