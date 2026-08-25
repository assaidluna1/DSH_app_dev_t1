from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class CotizacionBase(BaseModel):
    oportunidad_id: UUID
    numero: str
    subtotal_usd: Optional[Decimal] = Decimal("0.00")
    descuento_pct: Optional[Decimal] = Decimal("0.00")
    total_usd: Decimal = Decimal("0.00")
    estado: Optional[str] = "borrador"  # borrador, enviada, aceptada, rechazada, vencida


class CotizacionCreate(CotizacionBase):
    pass


class CotizacionUpdate(BaseModel):
    numero: Optional[str] = None
    subtotal_usd: Optional[Decimal] = None
    descuento_pct: Optional[Decimal] = None
    total_usd: Optional[Decimal] = None
    estado: Optional[str] = None


class CotizacionSchema(CotizacionBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedCotizaciones(BaseModel):
    items: List[CotizacionSchema]
    total: int
    page: int
    size: int
    pages: int
