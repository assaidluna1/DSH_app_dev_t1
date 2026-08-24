from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user, require_admin
from app.models.producto import Producto
from app.models.fabricante import Fabricante
from app.schemas.producto import ProductoSchema, ProductoCreate, ProductoUpdate

router = APIRouter(prefix="/productos", tags=["productos"], dependencies=[Depends(get_current_active_user)])


@router.get("/", response_model=List[ProductoSchema])
def list_productos(
    fabricante_id: Optional[UUID] = Query(None),
    categoria: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Producto)
    if fabricante_id:
        query = query.filter(Producto.fabricante_id == fabricante_id)
    if categoria:
        query = query.filter(Producto.categoria == categoria)
    if search:
        search_pat = f"%{search}%"
        query = query.filter(
            or_(
                Producto.nombre.ilike(search_pat),
                Producto.sku.ilike(search_pat),
                Producto.descripcion.ilike(search_pat),
            )
        )
    return query.order_by(Producto.nombre.asc()).all()


@router.post("/", response_model=ProductoSchema, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_producto(prod_in: ProductoCreate, db: Session = Depends(get_db)):
    fab = db.query(Fabricante).filter(Fabricante.id == prod_in.fabricante_id).first()
    if not fab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fabricante not found")

    prod = Producto(
        fabricante_id=prod_in.fabricante_id,
        nombre=prod_in.nombre,
        descripcion=prod_in.descripcion,
        categoria=prod_in.categoria,
        precio_lista_usd=prod_in.precio_lista_usd or 0,
        sku=prod_in.sku,
        activo=prod_in.activo if prod_in.activo is not None else True,
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod


@router.get("/{id}", response_model=ProductoSchema)
def get_producto(id: UUID, db: Session = Depends(get_db)):
    prod = db.query(Producto).filter(Producto.id == id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto not found")
    return prod


@router.put("/{id}", response_model=ProductoSchema, dependencies=[Depends(require_admin)])
def update_producto(id: UUID, prod_in: ProductoUpdate, db: Session = Depends(get_db)):
    prod = db.query(Producto).filter(Producto.id == id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto not found")

    update_data = prod_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prod, field, value)

    db.commit()
    db.refresh(prod)
    return prod
