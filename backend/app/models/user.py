import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(20), default="vendedor", nullable=False)  # 'admin', 'vendedor', 'viewer'
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    oportunidades = relationship("Oportunidad", back_populates="propietario")
    actividades = relationship("Actividad", back_populates="usuario")
    notas = relationship("Nota", back_populates="usuario")
