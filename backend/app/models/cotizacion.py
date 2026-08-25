import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class Cotizacion(Base):
    __tablename__ = "cotizaciones"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    oportunidad_id = Column(Uuid, ForeignKey("oportunidades.id"), nullable=False, index=True)
    numero = Column(String(50), nullable=False, unique=True, index=True)
    subtotal_usd = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)
    descuento_pct = Column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    total_usd = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)
    estado = Column(String(20), default="borrador", nullable=False, index=True)  # borrador, enviada, aceptada, rechazada, vencida
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    oportunidad = relationship("Oportunidad", back_populates="cotizaciones")
