from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserSchema


class NotaBase(BaseModel):
    contenido: str


class NotaCreate(NotaBase):
    pass


class NotaSchema(NotaBase):
    id: UUID
    oportunidad_id: UUID
    usuario_id: UUID
    created_at: datetime
    usuario: Optional[UserSchema] = None

    model_config = ConfigDict(from_attributes=True)
