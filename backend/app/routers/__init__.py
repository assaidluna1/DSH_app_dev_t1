from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.clientes import router as clientes_router
from app.routers.contactos import router as contactos_router
from app.routers.fabricantes import router as fabricantes_router
from app.routers.productos import router as productos_router
from app.routers.oportunidades import router as oportunidades_router
from app.routers.actividades import router as actividades_router
from app.routers.notas import router as notas_router
from app.routers.dashboard import router as dashboard_router

__all__ = [
    "auth_router",
    "users_router",
    "clientes_router",
    "contactos_router",
    "fabricantes_router",
    "productos_router",
    "oportunidades_router",
    "actividades_router",
    "notas_router",
    "dashboard_router",
]
