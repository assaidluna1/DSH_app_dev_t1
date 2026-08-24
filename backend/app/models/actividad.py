import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class Actividad(Base):
    __tablename__ = "actividades"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    oportunidad_id = Column(Uuid, ForeignKey("oportunidades.id", ondelete="CASCADE"), nullable=False, index=True)
    usuario_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    
    # 'llamada', 'reunion', 'email', 'demo', 'propuesta', 'seguimiento', 'otro'
    tipo = Column(String(50), nullable=False)
    titulo = Column(String(300), nullable=False)
    descripcion = Column(Text, nullable=True)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=False)
    duracion_min = Column(Integer, nullable=True)
    resultado = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    oportunidad = relationship("Oportunidad", back_populates="actividades")
    usuario = relationship("User", back_populates="actividades")
