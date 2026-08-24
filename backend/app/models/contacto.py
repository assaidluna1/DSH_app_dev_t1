import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class Contacto(Base):
    __tablename__ = "contactos"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    cliente_id = Column(Uuid, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=True)
    cargo = Column(String(150), nullable=True)
    email = Column(String(150), nullable=True)
    telefono = Column(String(30), nullable=True)
    es_decision_maker = Column(Boolean, default=False, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    cliente = relationship("Cliente", back_populates="contactos")
    oportunidades = relationship("Oportunidad", back_populates="contacto_principal")
