from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ContactoBase(BaseModel):
    cliente_id: UUID
    nombre: str
    apellido: Optional[str] = None
    cargo: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    es_decision_maker: Optional[bool] = False
    activo: Optional[bool] = True


class ContactoCreate(ContactoBase):
    pass


class ContactoUpdate(BaseModel):
    cliente_id: Optional[UUID] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    cargo: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    es_decision_maker: Optional[bool] = None
    activo: Optional[bool] = None


class ContactoSchema(ContactoBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
