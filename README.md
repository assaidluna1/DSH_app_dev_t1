# TechDist CRM

Sistema de administración de oportunidades comerciales para empresas de distribución de tecnología.

## Stack
- **Backend:** FastAPI + SQLAlchemy + Alembic + PostgreSQL
- **Frontend:** React + Vite + Tailwind CSS + Recharts
- **Infraestructura:** Docker + Docker Compose

## Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/assaidluna1/DSH_app_dev_t1.git
cd DSH_app_dev_t1

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con valores seguros

# 3. Levantar la aplicación
docker compose up --build

# Accesos:
# Frontend:  http://localhost:3000
# API Docs:  http://localhost:8000/docs
# Health:    http://localhost:8000/health
```

## Credenciales de demo
| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@techdist.mx | Techdist2025! | Admin |
| juan.garcia@techdist.mx | Techdist2025! | Vendedor |
| director@techdist.mx | Techdist2025! | Viewer (solo lectura) |

## Ejecutar tests
```bash
cd backend
pip install -r requirements.txt
pytest --tb=short -v
```

## Endpoints principales
- `GET  /health` — Estado del sistema
- `POST /api/v1/auth/login` — Autenticación
- `GET  /api/v1/dashboard/summary` — KPIs ejecutivos
- `GET  /api/v1/oportunidades` — Pipeline completo
- `GET  /api/v1/dashboard/forecast` — Forecast por periodo

## Contexto DSH
Este repositorio es la aplicación base para pruebas con DeepSeek Harness (EXP-06-06).
El archivo `psec/slice_base.yaml` define el contrato de ejecución del Quality Harness.
