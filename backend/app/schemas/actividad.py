from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserSchema


class ActividadBase(BaseModel):
    oportunidad_id: UUID
    tipo: str  # 'llamada', 'reunion', 'email', 'demo', 'propuesta', 'seguimiento', 'otro'
    titulo: str
    descripcion: Optional[str] = None
    fecha: Optional[datetime] = None
    duracion_min: Optional[int] = None
    resultado: Optional[str] = None


class ActividadCreate(ActividadBase):
    usuario_id: Optional[UUID] = None


class ActividadUpdate(BaseModel):
    tipo: Optional[str] = None
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha: Optional[datetime] = None
    duracion_min: Optional[int] = None
    resultado: Optional[str] = None


class ActividadSchema(ActividadBase):
    id: UUID
    usuario_id: UUID
    created_at: datetime
    usuario: Optional[UserSchema] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedActividades(BaseModel):
    items: List[ActividadSchema]
    total: int
    page: int
    size: int
    pages: int
