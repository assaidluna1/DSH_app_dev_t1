import math
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.models.actividad import Actividad
from app.models.cliente import Cliente
from app.models.contacto import Contacto
from app.models.nota import Nota
from app.models.oportunidad import Oportunidad
from app.models.oportunidad_producto import OportunidadProducto
from app.models.producto import Producto
from app.models.user import User
from app.schemas.actividad import ActividadSchema, ActividadCreate
from app.schemas.nota import NotaSchema, NotaBase
from app.schemas.oportunidad import (
    OportunidadSchema,
    OportunidadDetail,
    OportunidadCreate,
    OportunidadUpdate,
    OportunidadEtapaUpdate,
    OportunidadProductoSchema,
    OportunidadProductoCreate,
    PaginatedOportunidades,
)

router = APIRouter(prefix="/oportunidades", tags=["oportunidades"], dependencies=[Depends(get_current_active_user)])


def apply_stage_rules(etapa: str, update_dict: dict):
    if etapa == "ganado":
        update_dict["probabilidad"] = 100
    elif etapa == "perdido":
        update_dict["probabilidad"] = 0


@router.get("/", response_model=PaginatedOportunidades)
def list_oportunidades(
    etapa: Optional[str] = Query(None),
    propietario_id: Optional[UUID] = Query(None),
    cliente_id: Optional[UUID] = Query(None),
    prioridad: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    fecha_cierre_desde: Optional[date] = Query(None),
    fecha_cierre_hasta: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Oportunidad)

    if etapa:
        # Support comma separated stages e.g. "prospeccion,calificacion"
        etapas = [e.strip() for e in etapa.split(",") if e.strip()]
        if len(etapas) == 1:
            query = query.filter(Oportunidad.etapa == etapas[0])
        elif len(etapas) > 1:
            query = query.filter(Oportunidad.etapa.in_(etapas))

    if propietario_id:
        query = query.filter(Oportunidad.propietario_id == propietario_id)
    if cliente_id:
        query = query.filter(Oportunidad.cliente_id == cliente_id)
    if prioridad:
        query = query.filter(Oportunidad.prioridad == prioridad)
    if fecha_cierre_desde:
        query = query.filter(Oportunidad.fecha_cierre_estimada >= fecha_cierre_desde)
    if fecha_cierre_hasta:
        query = query.filter(Oportunidad.fecha_cierre_estimada <= fecha_cierre_hasta)

    if search:
        search_pat = f"%{search}%"
        query = query.join(Cliente, Oportunidad.cliente_id == Cliente.id).filter(
            or_(
                Oportunidad.nombre.ilike(search_pat),
                Oportunidad.descripcion.ilike(search_pat),
                Cliente.nombre.ilike(search_pat),
            )
        )

    total = query.count()
    pages = math.ceil(total / size) if total > 0 else 1
    items = (
        query.order_by(Oportunidad.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    return PaginatedOportunidades(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


@router.post("/", response_model=OportunidadSchema, status_code=status.HTTP_201_CREATED)
def create_oportunidad(
    opp_in: OportunidadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Verify cliente exists
    cliente = db.query(Cliente).filter(Cliente.id == opp_in.cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente not found")

    propietario_id = opp_in.propietario_id or current_user.id
    probabilidad = opp_in.probabilidad if opp_in.probabilidad is not None else 10.0
    if opp_in.etapa == "ganado":
        probabilidad = 100.0
    elif opp_in.etapa == "perdido":
        probabilidad = 0.0

    opp = Oportunidad(
        nombre=opp_in.nombre,
        cliente_id=opp_in.cliente_id,
        propietario_id=propietario_id,
        contacto_principal_id=opp_in.contacto_principal_id,
        etapa=opp_in.etapa or "prospeccion",
        valor_estimado_usd=opp_in.valor_estimado_usd or 0,
        probabilidad=probabilidad,
        fecha_cierre_estimada=opp_in.fecha_cierre_estimada,
        descripcion=opp_in.descripcion,
        origen=opp_in.origen,
        canal_origen=opp_in.canal_origen,
        prioridad=opp_in.prioridad or "media",
        motivo_perdida=opp_in.motivo_perdida,
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return opp


@router.get("/{id}", response_model=OportunidadDetail)
def get_oportunidad(id: UUID, db: Session = Depends(get_db)):
    opp = db.query(Oportunidad).filter(Oportunidad.id == id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidad not found")
    return opp


@router.put("/{id}", response_model=OportunidadSchema)
def update_oportunidad(id: UUID, opp_in: OportunidadUpdate, db: Session = Depends(get_db)):
    opp = db.query(Oportunidad).filter(Oportunidad.id == id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidad not found")

    update_data = opp_in.model_dump(exclude_unset=True)

    if "etapa" in update_data:
        apply_stage_rules(update_data["etapa"], update_data)

    for field, value in update_data.items():
        setattr(opp, field, value)

    opp.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(opp)
    return opp


@router.delete("/{id}")
def delete_oportunidad(id: UUID, db: Session = Depends(get_db)):
    opp = db.query(Oportunidad).filter(Oportunidad.id == id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidad not found")
    db.delete(opp)
    db.commit()
    return {"ok": True}


@router.patch("/{id}/etapa", response_model=OportunidadSchema)
def update_oportunidad_etapa(
    id: UUID,
    etapa_in: OportunidadEtapaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    opp = db.query(Oportunidad).filter(Oportunidad.id == id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidad not found")

    old_etapa = opp.etapa
    opp.etapa = etapa_in.etapa

    if etapa_in.etapa == "ganado":
        opp.probabilidad = 100.0
        opp.motivo_perdida = None
    elif etapa_in.etapa == "perdido":
        opp.probabilidad = 0.0
        opp.motivo_perdida = etapa_in.motivo_perdida
    else:
        opp.motivo_perdida = None

    # Auto-register a "seguimiento" activity when the etapa actually changes
    if old_etapa != etapa_in.etapa:
        new_actividad = Actividad(
            oportunidad_id=opp.id,
            usuario_id=current_user.id,
            tipo="seguimiento",
            titulo=f"Etapa actualizada a '{etapa_in.etapa}'",
            descripcion=f"Cambio de etapa: {old_etapa} → {etapa_in.etapa}",
            fecha=datetime.utcnow(),
        )
        db.add(new_actividad)

    opp.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(opp)
    return opp


# Nested activities
@router.get("/{id}/actividades", response_model=List[ActividadSchema])
def get_oportunidad_actividades(id: UUID, db: Session = Depends(get_db)):
    opp = db.query(Oportunidad).filter(Oportunidad.id == id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidad not found")
    return db.query(Actividad).filter(Actividad.oportunidad_id == id).order_by(Actividad.fecha.desc()).all()


@router.post("/{id}/actividades", response_model=ActividadSchema, status_code=status.HTTP_201_CREATED)
def create_oportunidad_actividad(
    id: UUID,
    act_in: ActividadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    opp = db.query(Oportunidad).filter(Oportunidad.id == id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidad not found")

    act = Actividad(
        oportunidad_id=id,
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


# Nested notes
@router.get("/{id}/notas", response_model=List[NotaSchema])
def get_oportunidad_notas(id: UUID, db: Session = Depends(get_db)):
    opp = db.query(Oportunidad).filter(Oportunidad.id == id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidad not found")
    return db.query(Nota).filter(Nota.oportunidad_id == id).order_by(Nota.created_at.desc()).all()


@router.post("/{id}/notas", response_model=NotaSchema, status_code=status.HTTP_201_CREATED)
def create_oportunidad_nota(
    id: UUID,
    nota_in: NotaBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    opp = db.query(Oportunidad).filter(Oportunidad.id == id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidad not found")

    nota = Nota(
        oportunidad_id=id,
        usuario_id=current_user.id,
        contenido=nota_in.contenido,
    )
    db.add(nota)
    db.commit()
    db.refresh(nota)
    return nota


# Nested products
@router.get("/{id}/productos", response_model=List[OportunidadProductoSchema])
def get_oportunidad_productos(id: UUID, db: Session = Depends(get_db)):
    opp = db.query(Oportunidad).filter(Oportunidad.id == id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidad not found")
    return db.query(OportunidadProducto).filter(OportunidadProducto.oportunidad_id == id).all()


@router.post("/{id}/productos", response_model=OportunidadProductoSchema, status_code=status.HTTP_201_CREATED)
def create_oportunidad_producto(
    id: UUID,
    item_in: OportunidadProductoCreate,
    db: Session = Depends(get_db),
):
    opp = db.query(Oportunidad).filter(Oportunidad.id == id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidad not found")

    producto = db.query(Producto).filter(Producto.id == item_in.producto_id).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto not found")

    precio = item_in.precio_unitario_usd if item_in.precio_unitario_usd is not None else producto.precio_lista_usd

    op_prod = OportunidadProducto(
        oportunidad_id=id,
        producto_id=item_in.producto_id,
        cantidad=item_in.cantidad or 1,
        precio_unitario_usd=precio,
    )
    db.add(op_prod)
    db.commit()
    db.refresh(op_prod)
    return op_prod


@router.delete("/{id}/productos/{producto_id}")
def delete_oportunidad_producto(id: UUID, producto_id: UUID, db: Session = Depends(get_db)):
    item = (
        db.query(OportunidadProducto)
        .filter(
            OportunidadProducto.oportunidad_id == id,
            OportunidadProducto.producto_id == producto_id,
        )
        .first()
    )
    if not item:
        # also try checking if producto_id is the record PK
        item = (
            db.query(OportunidadProducto)
            .filter(
                OportunidadProducto.oportunidad_id == id,
                OportunidadProducto.id == producto_id,
            )
            .first()
        )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not linked to opportunity")

    db.delete(item)
    db.commit()
    return {"ok": True}
