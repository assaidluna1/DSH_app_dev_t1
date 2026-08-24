import uuid
from sqlalchemy import Column, String, Boolean, Numeric, ForeignKey, Text, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class Producto(Base):
    __tablename__ = "productos"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    fabricante_id = Column(Uuid, ForeignKey("fabricantes.id"), nullable=False, index=True)
    nombre = Column(String(200), nullable=False, index=True)
    descripcion = Column(Text, nullable=True)
    categoria = Column(String(100), nullable=True)
    precio_lista_usd = Column(Numeric(15, 2), default=0, nullable=False)
    sku = Column(String(100), nullable=True, index=True)
    activo = Column(Boolean, default=True, nullable=False)

    # Relationships
    fabricante = relationship("Fabricante", back_populates="productos")
    oportunidad_productos = relationship("OportunidadProducto", back_populates="producto")
