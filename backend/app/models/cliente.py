import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    nombre = Column(String(200), nullable=False, index=True)
    industria = Column(String(100), nullable=True)
    num_empleados = Column(Integer, nullable=True)
    ciudad = Column(String(100), nullable=True)
    pais = Column(String(100), default="México", nullable=False)
    segmento = Column(String(50), default="SMB", nullable=False)  # 'SMB', 'Mid-Market', 'Enterprise'
    website = Column(String(200), nullable=True)
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    contactos = relationship("Contacto", back_populates="cliente", cascade="all, delete-orphan")
    oportunidades = relationship("Oportunidad", back_populates="cliente")
