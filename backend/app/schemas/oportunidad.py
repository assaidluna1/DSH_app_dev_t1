from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.user import UserSchema
from app.schemas.contacto import ContactoSchema
from app.schemas.producto import ProductoSchema
from app.schemas.actividad import ActividadSchema
from app.schemas.nota import NotaSchema


class ClienteBrief(BaseModel):
    id: UUID
    nombre: str
    industria: Optional[str] = None
    segmento: Optional[str] = None
    ciudad: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Opportunity Products
class OportunidadProductoBase(BaseModel):
    producto_id: UUID
    cantidad: Optional[int] = 1
    precio_unitario_usd: Optional[Decimal] = None


class OportunidadProductoCreate(OportunidadProductoBase):
    pass


class OportunidadProductoSchema(OportunidadProductoBase):
    id: UUID
    oportunidad_id: UUID
    producto: Optional[ProductoSchema] = None

    model_config = ConfigDict(from_attributes=True)


# Opportunity Base & Operations
class OportunidadBase(BaseModel):
    nombre: str
    cliente_id: UUID
    propietario_id: Optional[UUID] = None
    contacto_principal_id: Optional[UUID] = None
    etapa: Optional[str] = "prospeccion"
    valor_estimado_usd: Optional[Decimal] = Decimal("0.00")
    probabilidad: Optional[Decimal] = Decimal("10.00")
    fecha_cierre_estimada: Optional[date] = None
    descripcion: Optional[str] = None
    origen: Optional[str] = None
    canal_origen: Optional[str] = None
    prioridad: Optional[str] = "media"
    motivo_perdida: Optional[str] = None


class OportunidadCreate(OportunidadBase):
    pass


class OportunidadUpdate(BaseModel):
    nombre: Optional[str] = None
    cliente_id: Optional[UUID] = None
    propietario_id: Optional[UUID] = None
    contacto_principal_id: Optional[UUID] = None
    etapa: Optional[str] = None
    valor_estimado_usd: Optional[Decimal] = None
    probabilidad: Optional[Decimal] = None
    fecha_cierre_estimada: Optional[date] = None
    descripcion: Optional[str] = None
    origen: Optional[str] = None
    canal_origen: Optional[str] = None
    prioridad: Optional[str] = None
    motivo_perdida: Optional[str] = None


class OportunidadEtapaUpdate(BaseModel):
    etapa: str
    motivo_perdida: Optional[str] = None


class OportunidadSchema(OportunidadBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    cliente: Optional[ClienteBrief] = None
    propietario: Optional[UserSchema] = None
    contacto_principal: Optional[ContactoSchema] = None

    model_config = ConfigDict(from_attributes=True)


class OportunidadDetail(OportunidadSchema):
    productos: List[OportunidadProductoSchema] = Field(default_factory=list)
    actividades: List[ActividadSchema] = Field(default_factory=list)
    notas: List[NotaSchema] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class PaginatedOportunidades(BaseModel):
    items: List[OportunidadSchema]
    total: int
    page: int
    size: int
    pages: int
