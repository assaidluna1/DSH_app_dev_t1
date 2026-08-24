from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.schemas.fabricante import FabricanteSchema


class ProductoBase(BaseModel):
    fabricante_id: UUID
    nombre: str
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    precio_lista_usd: Optional[Decimal] = Decimal("0.00")
    sku: Optional[str] = None
    activo: Optional[bool] = True


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    fabricante_id: Optional[UUID] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    precio_lista_usd: Optional[Decimal] = None
    sku: Optional[str] = None
    activo: Optional[bool] = None


class ProductoSchema(ProductoBase):
    id: UUID
    fabricante: Optional[FabricanteSchema] = None

    model_config = ConfigDict(from_attributes=True)
