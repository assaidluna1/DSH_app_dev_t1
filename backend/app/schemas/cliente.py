from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.contacto import ContactoSchema


class OportunidadBrief(BaseModel):
    id: UUID
    nombre: str
    etapa: str
    valor_estimado_usd: Decimal
    probabilidad: Decimal
    prioridad: str

    model_config = ConfigDict(from_attributes=True)


class ClienteBase(BaseModel):
    nombre: str
    industria: Optional[str] = None
    num_empleados: Optional[int] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = "México"
    segmento: Optional[str] = "SMB"  # 'SMB', 'Mid-Market', 'Enterprise'
    website: Optional[str] = None
    activo: Optional[bool] = True


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    industria: Optional[str] = None
    num_empleados: Optional[int] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = None
    segmento: Optional[str] = None
    website: Optional[str] = None
    activo: Optional[bool] = None


class ClienteSchema(ClienteBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClienteDetailSchema(ClienteSchema):
    contactos: List[ContactoSchema] = Field(default_factory=list)
    oportunidades_activas: List[OportunidadBrief] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class ClienteStatsSchema(BaseModel):
    total_oportunidades: int
    valor_pipeline: float
    valor_ganado: float
    win_rate: float


class PaginatedClientes(BaseModel):
    items: List[ClienteSchema]
    total: int
    page: int
    size: int
    pages: int
