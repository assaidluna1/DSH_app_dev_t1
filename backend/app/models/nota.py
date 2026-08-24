import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Text, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class Nota(Base):
    __tablename__ = "notas"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    oportunidad_id = Column(Uuid, ForeignKey("oportunidades.id", ondelete="CASCADE"), nullable=False, index=True)
    usuario_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    contenido = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    oportunidad = relationship("Oportunidad", back_populates="notas")
    usuario = relationship("User", back_populates="notas")
