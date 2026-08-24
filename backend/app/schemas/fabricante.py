from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class FabricanteBase(BaseModel):
    nombre: str
    categoria: Optional[str] = None
    logo_url: Optional[str] = None
    activo: Optional[bool] = True


class FabricanteCreate(FabricanteBase):
    pass


class FabricanteUpdate(BaseModel):
    nombre: Optional[str] = None
    categoria: Optional[str] = None
    logo_url: Optional[str] = None
    activo: Optional[bool] = None


class FabricanteSchema(FabricanteBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)
