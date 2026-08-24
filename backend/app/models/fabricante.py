import uuid
from sqlalchemy import Column, String, Boolean, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class Fabricante(Base):
    __tablename__ = "fabricantes"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    nombre = Column(String(150), unique=True, nullable=False, index=True)
    categoria = Column(String(100), nullable=True)  # networking, storage, compute, security, software, cloud
    logo_url = Column(String(300), nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    # Relationships
    productos = relationship("Producto", back_populates="fabricante")
