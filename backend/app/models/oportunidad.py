import uuid
from datetime import datetime
from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey, Text, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class Oportunidad(Base):
    __tablename__ = "oportunidades"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    nombre = Column(String(300), nullable=False, index=True)
    cliente_id = Column(Uuid, ForeignKey("clientes.id"), nullable=False, index=True)
    propietario_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    contacto_principal_id = Column(Uuid, ForeignKey("contactos.id"), nullable=True, index=True)
    
    # 'prospeccion', 'calificacion', 'propuesta_tecnica', 'propuesta_comercial', 'negociacion', 'ganado', 'perdido'
    etapa = Column(String(50), default="prospeccion", nullable=False, index=True)
    valor_estimado_usd = Column(Numeric(15, 2), default=0, nullable=False)
    probabilidad = Column(Numeric(5, 2), default=10, nullable=False)  # 0 to 100
    fecha_cierre_estimada = Column(Date, nullable=True)
    descripcion = Column(Text, nullable=True)
    origen = Column(String(50), nullable=True)  # 'referido', 'outbound', 'inbound', 'renovacion', 'otro'
    prioridad = Column(String(20), default="media", nullable=False)  # 'alta', 'media', 'baja'
    motivo_perdida = Column(String(300), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    cliente = relationship("Cliente", back_populates="oportunidades")
    propietario = relationship("User", back_populates="oportunidades")
    contacto_principal = relationship("Contacto", back_populates="oportunidades")
    productos = relationship("OportunidadProducto", back_populates="oportunidad", cascade="all, delete-orphan")
    actividades = relationship("Actividad", back_populates="oportunidad", cascade="all, delete-orphan")
    notas = relationship("Nota", back_populates="oportunidad", cascade="all, delete-orphan")
