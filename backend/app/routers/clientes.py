import math
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.models.cliente import Cliente
from app.models.oportunidad import Oportunidad
from app.models.user import User
from app.schemas.cliente import (
    ClienteSchema,
    ClienteCreate,
    ClienteUpdate,
    ClienteDetailSchema,
    ClienteStatsSchema,
    PaginatedClientes,
)

router = APIRouter(prefix="/clientes", tags=["clientes"], dependencies=[Depends(get_current_active_user)])


@router.get("/", response_model=PaginatedClientes)
def list_clientes(
    search: Optional[str] = Query(None),
    segmento: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Cliente)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Cliente.nombre.ilike(search_pattern),
                Cliente.industria.ilike(search_pattern),
                Cliente.ciudad.ilike(search_pattern),
            )
        )

    if segmento:
        query = query.filter(Cliente.segmento == segmento)

    total = query.count()
    pages = math.ceil(total / size) if total > 0 else 1
    items = query.order_by(Cliente.nombre.asc()).offset((page - 1) * size).limit(size).all()

    return PaginatedClientes(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


@router.post("/", response_model=ClienteSchema, status_code=status.HTTP_201_CREATED)
def create_cliente(cliente_in: ClienteCreate, db: Session = Depends(get_db)):
    cliente = Cliente(
        nombre=cliente_in.nombre,
        industria=cliente_in.industria,
        num_empleados=cliente_in.num_empleados,
        ciudad=cliente_in.ciudad,
        pais=cliente_in.pais or "México",
        segmento=cliente_in.segmento or "SMB",
        website=cliente_in.website,
        activo=cliente_in.activo if cliente_in.activo is not None else True,
    )
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.get("/{id}", response_model=ClienteDetailSchema)
def get_cliente(id: UUID, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == id).first()
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente not found")

    # Get active opportunities (not in 'ganado' or 'perdido')
    opps = (
        db.query(Oportunidad)
        .filter(
            Oportunidad.cliente_id == id,
            ~Oportunidad.etapa.in_(["ganado", "perdido"]),
        )
        .all()
    )

    return ClienteDetailSchema(
        id=cliente.id,
        nombre=cliente.nombre,
        industria=cliente.industria,
        num_empleados=cliente.num_empleados,
        ciudad=cliente.ciudad,
        pais=cliente.pais,
        segmento=cliente.segmento,
        website=cliente.website,
        activo=cliente.activo,
        created_at=cliente.created_at,
        updated_at=cliente.updated_at,
        contactos=cliente.contactos,
        oportunidades_activas=opps,
    )


@router.put("/{id}", response_model=ClienteSchema)
def update_cliente(id: UUID, cliente_in: ClienteUpdate, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == id).first()
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente not found")

    update_data = cliente_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cliente, field, value)

    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete("/{id}")
def delete_cliente(id: UUID, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == id).first()
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente not found")
    db.delete(cliente)
    db.commit()
    return {"ok": True}


@router.get("/{id}/stats", response_model=ClienteStatsSchema)
def get_cliente_stats(id: UUID, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == id).first()
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente not found")

    opps = db.query(Oportunidad).filter(Oportunidad.cliente_id == id).all()
    total_oportunidades = len(opps)
    
    open_opps = [o for o in opps if o.etapa not in ["ganado", "perdido"]]
    valor_pipeline = float(sum(o.valor_estimado_usd or 0 for o in open_opps))
    
    ganadas = [o for o in opps if o.etapa == "ganado"]
    perdidas = [o for o in opps if o.etapa == "perdido"]
    valor_ganado = float(sum(o.valor_estimado_usd or 0 for o in ganadas))
    
    cerradas = len(ganadas) + len(perdidas)
    win_rate = round((len(ganadas) / cerradas) * 100.0, 2) if cerradas > 0 else 0.0

    return ClienteStatsSchema(
        total_oportunidades=total_oportunidades,
        valor_pipeline=round(valor_pipeline, 2),
        valor_ganado=round(valor_ganado, 2),
        win_rate=win_rate,
    )
