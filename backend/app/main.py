from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import check_db_connection
from app.routers import (
    auth_router,
    users_router,
    clientes_router,
    contactos_router,
    fabricantes_router,
    productos_router,
    oportunidades_router,
    actividades_router,
    notas_router,
    dashboard_router,
    cotizaciones,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
def health_check():
    db_status = "connected" if check_db_connection() else "disconnected"
    return {
        "status": "ok",
        "version": settings.VERSION,
        "db": db_status,
    }


@app.get(f"{settings.API_V1_STR}/info", tags=["system"])
def system_info():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(clientes_router, prefix=settings.API_V1_STR)
app.include_router(contactos_router, prefix=settings.API_V1_STR)
app.include_router(fabricantes_router, prefix=settings.API_V1_STR)
app.include_router(productos_router, prefix=settings.API_V1_STR)
app.include_router(oportunidades_router, prefix=settings.API_V1_STR)
app.include_router(actividades_router, prefix=settings.API_V1_STR)
app.include_router(notas_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(cotizaciones.router, prefix=settings.API_V1_STR)
