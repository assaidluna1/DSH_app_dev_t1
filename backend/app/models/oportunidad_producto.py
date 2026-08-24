import uuid
from sqlalchemy import Column, Integer, Numeric, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class OportunidadProducto(Base):
    __tablename__ = "oportunidad_productos"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    oportunidad_id = Column(Uuid, ForeignKey("oportunidades.id", ondelete="CASCADE"), nullable=False, index=True)
    producto_id = Column(Uuid, ForeignKey("productos.id"), nullable=False, index=True)
    cantidad = Column(Integer, default=1, nullable=False)
    precio_unitario_usd = Column(Numeric(15, 2), nullable=True)

    # Relationships
    oportunidad = relationship("Oportunidad", back_populates="productos")
    producto = relationship("Producto", back_populates="oportunidad_productos")
