# PROMPT MAESTRO — TechDist CRM
## Instrucción para antogravity IDE

> **Objetivo de uso:** Este prompt se entrega íntegramente a antogravity IDE para que construya la aplicación base y la suba al repositorio indicado. No requiere intervención adicional del operador salvo las credenciales de entorno (`.env`).

---

## 0. META-INSTRUCCIONES PARA EL IDE

Eres un agente de ingeniería senior. Tu tarea es construir **desde cero** la aplicación completa descrita en este documento, confirmarla en el repositorio GitHub indicado y asegurarte de que `docker compose up` levanta el sistema sin errores. Sigue estas reglas de ejecución:

1. **Lee este documento completo antes de generar cualquier archivo.**
2. **No omitas ninguna sección.** Cada tabla de modelos, cada endpoint, cada componente de UI deben existir en el código entregado.
3. **Prioridad de corrección:** la aplicación debe arrancar (`docker compose up --build`), responder en `/health`, y pasar `pytest` sin errores antes de hacer el commit final.
4. **Idioma del código:** inglés (nombres de variables, funciones, módulos). Los textos de UI visibles para el usuario final van en español.
5. **Commit atómico único al final:** un solo commit con mensaje `feat: initial TechDist CRM application` seguido de `push` a la rama `main` del repositorio `https://github.com/assaidluna1/DSH_app_dev_t1`.
6. **Incluye `.env.example`** con todas las variables necesarias (sin valores reales). El `.env` real **nunca** se commitea.
7. **Seed data obligatorio:** el `Dockerfile` del backend debe ejecutar un script de seed que pueble la base de datos con datos sintéticos representativos al primer arranque (ver Sección 7).

---

## 1. IDENTIDAD DEL PROYECTO

| Campo | Valor |
|---|---|
| Nombre del sistema | **TechDist CRM** |
| Descripción | Sistema de administración de oportunidades comerciales para una empresa de distribución de tecnología. Diseñado para dar visibilidad total del pipeline de ventas al **Director Comercial** y al **CEO**. |
| Repositorio destino | `https://github.com/assaidluna1/DSH_app_dev_t1` |
| Rama | `main` |
| Propósito secundario | Servir como aplicación base para pruebas con **DeepSeek Harness (DSH)**: los endpoints deben ser deterministas, testeables y con cobertura de pruebas automatizadas. |

---

## 2. STACK TECNOLÓGICO OBLIGATORIO

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Backend API | **FastAPI** (Python) | 0.111+ |
| ORM | **SQLAlchemy** 2.x + **Alembic** | 2.0+ |
| Base de datos | **PostgreSQL** | 15+ |
| Autenticación | **JWT** (python-jose + passlib bcrypt) | — |
| Frontend | **React** + **Vite** + **Tailwind CSS** | React 18, Vite 5 |
| Gráficas | **Recharts** | 2.x |
| Contenedores | **Docker** + **Docker Compose** v2 | — |
| Testing backend | **pytest** + **httpx** (AsyncClient) | — |
| Servidor de prod | **Nginx** como reverse proxy del frontend | 1.25-alpine |

**No usar:** Flask, Django, Next.js, Kubernetes, Redis, Celery, ni ninguna otra dependencia no listada aquí, salvo utilidades estándar de Python/JS.

---

## 3. ESTRUCTURA DE DIRECTORIOS

```
DSH_app_dev_t1/
├── docker-compose.yml
├── docker-compose.override.yml        # overrides para dev local (hot-reload)
├── .env.example
├── README.md
├── psec/
│   └── slice_base.yaml                # Contrato PSEC de referencia (ver Sección 9)
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/                  # migraciones generadas
│   ├── scripts/
│   │   └── seed.py                    # script de datos sintéticos
│   ├── app/
│   │   ├── main.py                    # FastAPI app factory
│   │   ├── config.py                  # Settings desde env vars
│   │   ├── database.py                # Engine + SessionLocal
│   │   ├── dependencies.py            # get_db, get_current_user
│   │   ├── security.py                # JWT helpers
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── cliente.py
│   │   │   ├── contacto.py
│   │   │   ├── fabricante.py
│   │   │   ├── producto.py
│   │   │   ├── oportunidad.py
│   │   │   ├── oportunidad_producto.py
│   │   │   ├── actividad.py
│   │   │   └── nota.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── cliente.py
│   │   │   ├── contacto.py
│   │   │   ├── fabricante.py
│   │   │   ├── producto.py
│   │   │   ├── oportunidad.py
│   │   │   ├── actividad.py
│   │   │   ├── nota.py
│   │   │   └── dashboard.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── clientes.py
│   │   │   ├── contactos.py
│   │   │   ├── fabricantes.py
│   │   │   ├── productos.py
│   │   │   ├── oportunidades.py
│   │   │   ├── actividades.py
│   │   │   ├── notas.py
│   │   │   └── dashboard.py
│   │   └── services/
│   │       ├── dashboard_service.py
│   │       └── forecast_service.py
│   └── tests/
│       ├── conftest.py
│       ├── test_health.py
│       ├── test_auth.py
│       ├── test_oportunidades.py
│       ├── test_clientes.py
│       ├── test_dashboard.py
│       └── test_forecast.py
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/
        │   ├── client.js              # axios instance
        │   ├── auth.js
        │   ├── oportunidades.js
        │   ├── clientes.js
        │   ├── dashboard.js
        │   └── actividades.js
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   └── useAuth.js
        ├── components/
        │   ├── Layout/
        │   │   ├── Sidebar.jsx
        │   │   ├── Topbar.jsx
        │   │   └── Layout.jsx
        │   ├── Dashboard/
        │   │   ├── KPICard.jsx
        │   │   ├── PipelineFunnel.jsx
        │   │   ├── ForecastChart.jsx
        │   │   ├── TopOportunidades.jsx
        │   │   ├── PipelineByRep.jsx
        │   │   └── WinLossChart.jsx
        │   ├── Oportunidades/
        │   │   ├── OportunidadTable.jsx
        │   │   ├── OportunidadKanban.jsx
        │   │   ├── OportunidadForm.jsx
        │   │   └── OportunidadDetail.jsx
        │   ├── Clientes/
        │   │   ├── ClienteTable.jsx
        │   │   └── ClienteForm.jsx
        │   └── Shared/
        │       ├── Badge.jsx
        │       ├── Modal.jsx
        │       └── LoadingSpinner.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Pipeline.jsx
            ├── Oportunidades.jsx
            ├── Clientes.jsx
            ├── Contactos.jsx
            └── Actividades.jsx
```

---

## 4. MODELOS DE BASE DE DATOS

### 4.1 `users`
```
id            UUID PK default gen_random_uuid()
nombre        VARCHAR(100) NOT NULL
email         VARCHAR(150) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
rol           ENUM('admin', 'vendedor', 'viewer') DEFAULT 'vendedor'
activo        BOOLEAN DEFAULT TRUE
created_at    TIMESTAMP DEFAULT now()
updated_at    TIMESTAMP DEFAULT now()
```

### 4.2 `clientes` (Accounts)
```
id            UUID PK
nombre        VARCHAR(200) NOT NULL
industria     VARCHAR(100)
num_empleados INTEGER
ciudad        VARCHAR(100)
pais          VARCHAR(100) DEFAULT 'México'
segmento      ENUM('SMB', 'Mid-Market', 'Enterprise') DEFAULT 'SMB'
website       VARCHAR(200)
activo        BOOLEAN DEFAULT TRUE
created_at    TIMESTAMP DEFAULT now()
updated_at    TIMESTAMP DEFAULT now()
```

### 4.3 `contactos`
```
id              UUID PK
cliente_id      UUID FK → clientes.id ON DELETE CASCADE
nombre          VARCHAR(100) NOT NULL
apellido        VARCHAR(100)
cargo           VARCHAR(150)
email           VARCHAR(150)
telefono        VARCHAR(30)
es_decision_maker BOOLEAN DEFAULT FALSE
activo          BOOLEAN DEFAULT TRUE
created_at      TIMESTAMP DEFAULT now()
```

### 4.4 `fabricantes` (Vendors / Manufacturers)
```
id        UUID PK
nombre    VARCHAR(150) UNIQUE NOT NULL
categoria VARCHAR(100)           -- networking, storage, compute, security, software, cloud
logo_url  VARCHAR(300)
activo    BOOLEAN DEFAULT TRUE
```

### 4.5 `productos`
```
id             UUID PK
fabricante_id  UUID FK → fabricantes.id
nombre         VARCHAR(200) NOT NULL
descripcion    TEXT
categoria      VARCHAR(100)
precio_lista_usd NUMERIC(15,2)
sku            VARCHAR(100)
activo         BOOLEAN DEFAULT TRUE
```

### 4.6 `oportunidades` ← **Entidad central**
```
id                     UUID PK
nombre                 VARCHAR(300) NOT NULL
cliente_id             UUID FK → clientes.id
propietario_id         UUID FK → users.id
contacto_principal_id  UUID FK → contactos.id (NULLABLE)
etapa                  ENUM('prospeccion','calificacion','propuesta_tecnica',
                             'propuesta_comercial','negociacion',
                             'ganado','perdido') DEFAULT 'prospeccion'
valor_estimado_usd     NUMERIC(15,2) NOT NULL DEFAULT 0
probabilidad           NUMERIC(5,2) NOT NULL DEFAULT 10   -- 0-100 %
fecha_cierre_estimada  DATE
descripcion            TEXT
origen                 ENUM('referido','outbound','inbound','renovacion','otro')
prioridad              ENUM('alta','media','baja') DEFAULT 'media'
motivo_perdida         VARCHAR(300)     -- solo si etapa=perdido
created_at             TIMESTAMP DEFAULT now()
updated_at             TIMESTAMP DEFAULT now()
```

> **Regla de negocio:** cuando `etapa` cambia a `ganado`, `probabilidad` se fuerza a 100. Cuando cambia a `perdido`, `probabilidad` se fuerza a 0.

### 4.7 `oportunidad_productos` (M-N)
```
id               UUID PK
oportunidad_id   UUID FK → oportunidades.id ON DELETE CASCADE
producto_id      UUID FK → productos.id
cantidad         INTEGER DEFAULT 1
precio_unitario_usd NUMERIC(15,2)
```

### 4.8 `actividades`
```
id             UUID PK
oportunidad_id UUID FK → oportunidades.id ON DELETE CASCADE
usuario_id     UUID FK → users.id
tipo           ENUM('llamada','reunion','email','demo','propuesta','seguimiento','otro')
titulo         VARCHAR(300) NOT NULL
descripcion    TEXT
fecha          TIMESTAMP NOT NULL DEFAULT now()
duracion_min   INTEGER
resultado      VARCHAR(300)
created_at     TIMESTAMP DEFAULT now()
```

### 4.9 `notas`
```
id             UUID PK
oportunidad_id UUID FK → oportunidades.id ON DELETE CASCADE
usuario_id     UUID FK → users.id
contenido      TEXT NOT NULL
created_at     TIMESTAMP DEFAULT now()
```

---

## 5. ESPECIFICACIÓN COMPLETA DE LA API

**Prefijo base:** `/api/v1`  
**Autenticación:** Bearer JWT en todos los endpoints excepto `/health` y `/api/v1/auth/login`.

### 5.1 System
```
GET  /health
     → { status: "ok", version: "1.0.0", db: "connected" }

GET  /api/v1/info
     → { app: "TechDist CRM", version: "1.0.0", environment: str }
```

### 5.2 Auth (`/api/v1/auth`)
```
POST /login
     body: { email: str, password: str }
     → { access_token: str, token_type: "bearer", user: UserSchema }

POST /refresh
     header: Authorization Bearer <token>
     → { access_token: str }

GET  /me
     → UserSchema
```

### 5.3 Users (`/api/v1/users`) — solo rol admin
```
GET    /            → List[UserSchema]
POST   /            body: UserCreate → UserSchema
GET    /{id}        → UserSchema
PUT    /{id}        body: UserUpdate → UserSchema
DELETE /{id}        → { ok: true }
```

### 5.4 Clientes (`/api/v1/clientes`)
```
GET    /            query: ?search=str&segmento=str&page=1&size=20
                    → PaginatedResponse[ClienteSchema]
POST   /            body: ClienteCreate → ClienteSchema
GET    /{id}        → ClienteSchema + contactos + oportunidades_activas
PUT    /{id}        body: ClienteUpdate → ClienteSchema
DELETE /{id}        → { ok: true }
GET    /{id}/stats  → { total_oportunidades, valor_pipeline, valor_ganado, win_rate }
```

### 5.5 Contactos (`/api/v1/contactos`)
```
GET    /            query: ?cliente_id=uuid&search=str
                    → List[ContactoSchema]
POST   /            body: ContactoCreate → ContactoSchema
GET    /{id}        → ContactoSchema
PUT    /{id}        body: ContactoUpdate → ContactoSchema
DELETE /{id}        → { ok: true }
```

### 5.6 Fabricantes (`/api/v1/fabricantes`)
```
GET    /            → List[FabricanteSchema]
POST   /            body: FabricanteCreate → FabricanteSchema (admin only)
GET    /{id}        → FabricanteSchema
PUT    /{id}        body: FabricanteUpdate → FabricanteSchema (admin only)
```

### 5.7 Productos (`/api/v1/productos`)
```
GET    /            query: ?fabricante_id=uuid&categoria=str&search=str
                    → List[ProductoSchema]
POST   /            body: ProductoCreate → ProductoSchema (admin only)
GET    /{id}        → ProductoSchema
PUT    /{id}        body: ProductoUpdate → ProductoSchema (admin only)
```

### 5.8 Oportunidades (`/api/v1/oportunidades`) ← **Endpoints más críticos**
```
GET    /
       query: ?etapa=str&propietario_id=uuid&cliente_id=uuid
              &prioridad=str&search=str&page=1&size=20
              &fecha_cierre_desde=date&fecha_cierre_hasta=date
       → PaginatedResponse[OportunidadSchema]

POST   /
       body: OportunidadCreate → OportunidadSchema

GET    /{id}
       → OportunidadDetail (incluye actividades recientes, notas, productos)

PUT    /{id}
       body: OportunidadUpdate → OportunidadSchema

DELETE /{id}
       → { ok: true }

PATCH  /{id}/etapa
       body: { etapa: str, motivo_perdida?: str }
       → OportunidadSchema
       NOTA: aplica regla de negocio de probabilidad automática

GET    /{id}/actividades
       → List[ActividadSchema]

POST   /{id}/actividades
       body: ActividadCreate → ActividadSchema

GET    /{id}/notas
       → List[NotaSchema]

POST   /{id}/notas
       body: { contenido: str } → NotaSchema

GET    /{id}/productos
       → List[OportunidadProductoSchema]

POST   /{id}/productos
       body: OportunidadProductoCreate → OportunidadProductoSchema

DELETE /{id}/productos/{producto_id}
       → { ok: true }
```

### 5.9 Dashboard (`/api/v1/dashboard`) ← **KPIs ejecutivos**
```
GET  /summary
     → {
         pipeline_total_usd:       float,   # suma bruta de valor_estimado
         pipeline_ponderado_usd:   float,   # suma de valor * probabilidad/100
         oportunidades_abiertas:   int,
         oportunidades_ganadas_mes: int,
         oportunidades_perdidas_mes: int,
         valor_ganado_mes_usd:     float,
         win_rate_mes:             float,   # % ganadas / (ganadas+perdidas)
         ticket_promedio_usd:      float,
         velocidad_promedio_dias:  float    # días promedio desde creación a cierre ganado
       }

GET  /pipeline-por-etapa
     → List[{ etapa: str, count: int, valor_total_usd: float, valor_ponderado_usd: float }]

GET  /pipeline-por-vendedor
     → List[{ vendedor: str, count: int, valor_total_usd: float, win_rate: float }]

GET  /pipeline-por-fabricante
     → List[{ fabricante: str, count: int, valor_total_usd: float }]

GET  /top-oportunidades
     query: ?limit=10
     → List[OportunidadSchema]   # ordenadas por valor DESC, etapa != perdido

GET  /forecast
     query: ?periodo=mes|trimestre|año
     → {
         periodo: str,
         fecha_inicio: date,
         fecha_fin: date,
         pipeline_en_periodo:  float,     # oportunidades con cierre en el periodo
         forecast_ponderado:   float,     # ponderado por probabilidad
         ganado_a_la_fecha:    float,
         meta_estimada:        float      # opcional, se puede dejar null
       }

GET  /actividad-reciente
     query: ?dias=7&limit=20
     → List[ActividadSchema]     # actividades de los últimos N días

GET  /win-loss-trend
     query: ?meses=6
     → List[{
         mes: str,               # "2025-01", "2025-02"...
         ganadas: int,
         perdidas: int,
         valor_ganado_usd: float
       }]
```

### 5.10 Actividades (`/api/v1/actividades`)
```
GET  /    query: ?oportunidad_id=uuid&usuario_id=uuid&tipo=str&page=1&size=30
          → PaginatedResponse[ActividadSchema]
POST /    body: ActividadCreate → ActividadSchema
GET  /{id}    → ActividadSchema
PUT  /{id}    body: ActividadUpdate → ActividadSchema
DELETE /{id}  → { ok: true }
```

---

## 6. DISEÑO DE LA INTERFAZ DE USUARIO (Frontend)

### 6.1 Principios de diseño
- **Tema:** oscuro, profesional, tonos `slate-900` / `slate-800` como fondos, `blue-500` / `emerald-500` como acentos.
- **Responsive:** funciona en 1280px+ (optimizado para desktop ejecutivo).
- **Navegación:** Sidebar izquierdo fijo con las secciones indicadas. Topbar con nombre del usuario y botón de logout.

### 6.2 Páginas y contenido mínimo obligatorio

#### **Página: Login (`/login`)**
- Formulario centrado con campos email + contraseña.
- Botón "Iniciar sesión".
- Manejo de error si credenciales inválidas.

#### **Página: Dashboard (`/`)**
Resumen ejecutivo. Contiene:
1. **Fila de KPI Cards (6 tarjetas):**
   - Pipeline Total (USD)
   - Pipeline Ponderado (USD) — con tooltip explicando la ponderación por probabilidad
   - Oportunidades Abiertas
   - Ganadas este mes
   - Win Rate del mes (%)
   - Ticket Promedio (USD)
2. **Gráfica: Embudo de Pipeline por Etapa** — gráfica de barras horizontales mostrando count y valor por etapa (usa Recharts BarChart).
3. **Gráfica: Forecast Mensual** — BarChart agrupado: pipeline_en_periodo vs forecast_ponderado vs ganado_a_la_fecha para el mes y trimestre actual.
4. **Tabla: Top 10 Oportunidades** — columnas: Nombre, Cliente, Etapa (badge de color), Valor USD, Probabilidad, Fecha Cierre Est., Propietario. Clickeable para ir al detalle.
5. **Gráfica: Pipeline por Vendedor** — BarChart horizontal.
6. **Gráfica: Tendencia Win/Loss** — LineChart de los últimos 6 meses: línea de ganadas vs línea de perdidas.

#### **Página: Pipeline (`/pipeline`)**
- Vista **Kanban** de las oportunidades agrupadas por etapa (columnas: Prospección → Calificación → Propuesta Técnica → Propuesta Comercial → Negociación).
- Cada tarjeta muestra: nombre, cliente, valor USD, propietario (avatar inicial), fecha cierre estimada, badge de prioridad.
- Drag-and-drop opcional (si no es posible, botón "Mover a etapa" en la tarjeta).
- Botón "Nueva Oportunidad" que abre modal con el formulario.

#### **Página: Oportunidades (`/oportunidades`)**
- Tabla paginada con filtros: búsqueda por texto, filtro por etapa (multiselect), filtro por propietario, filtro por fecha de cierre.
- Columnas: Nombre, Cliente, Etapa, Valor USD, Probabilidad %, Fecha Cierre, Propietario, Acciones (ver / editar / eliminar).
- Botón "Nueva Oportunidad".
- Al hacer click en una fila → detalle completo con: tabs (Info General / Actividades / Notas / Productos).

#### **Página: Clientes (`/clientes`)**
- Tabla paginada con búsqueda y filtro por segmento.
- Columnas: Nombre, Industria, Segmento, Ciudad, Oportunidades Abiertas, Valor Pipeline.
- Al hacer click → detalle del cliente con estadísticas y lista de oportunidades.

#### **Página: Contactos (`/contactos`)**
- Tabla simple con búsqueda, filtro por cliente.
- Columnas: Nombre, Cargo, Email, Empresa, Decision Maker (badge).

#### **Página: Actividades (`/actividades`)**
- Feed cronológico de actividades recientes (7 días por defecto con selector).
- Filtro por tipo de actividad.
- Cada item muestra: tipo (icono), título, oportunidad relacionada, usuario, fecha.

### 6.3 Componentes de UI reutilizables
- **Badge de etapa:** color codificado por etapa:
  - prospeccion → gris
  - calificacion → azul
  - propuesta_tecnica → amarillo
  - propuesta_comercial → naranja
  - negociacion → púrpura
  - ganado → verde
  - perdido → rojo
- **Badge de prioridad:** alta → rojo, media → amarillo, baja → gris
- **Formato de moneda:** todos los valores USD muestran `$1,234,567.00 USD`
- **Loading spinner** para estados de carga de API
- **Toasts** de éxito/error en operaciones CRUD

---

## 7. DATOS SINTÉTICOS DE SEED

El script `backend/scripts/seed.py` debe crear los siguientes datos al primer arranque (solo si la tabla `users` está vacía):

### Usuarios (6)
```
admin@techdist.mx      | Admin      | rol: admin
juan.garcia@techdist.mx | Juan García | rol: vendedor
maria.lopez@techdist.mx | María López | rol: vendedor
carlos.reyes@techdist.mx | Carlos Reyes | rol: vendedor
ana.torres@techdist.mx  | Ana Torres  | rol: vendedor
director@techdist.mx    | Director Comercial | rol: viewer
```
Contraseña para todos: `Techdist2025!`

### Fabricantes (8)
Cisco Systems, HP Enterprise, Dell Technologies, Microsoft, Fortinet, Veeam Software, VMware (Broadcom), Aruba Networks (HPE)

### Productos (16, 2 por fabricante)
Ejemplos representativos de productos de distribución tecnológica (switches, servidores, licencias de software, firewalls, soluciones de backup, etc.). Precios de lista entre $500 y $150,000 USD.

### Clientes (15)
Empresas mexicanas ficticias de distintos segmentos (5 SMB, 6 Mid-Market, 4 Enterprise) en industrias como: manufactura, retail, financiero, salud, gobierno estatal, educación. Ciudades: CDMX, Monterrey, Guadalajara, Puebla, Querétaro.

### Contactos (30, 2 por cliente)
Con roles como: Director de TI, CTO, Gerente de Compras, CEO. Al menos 1 decision_maker por cliente.

### Oportunidades (40)
Distribución por etapa:
- prospeccion: 8
- calificacion: 8
- propuesta_tecnica: 7
- propuesta_comercial: 6
- negociacion: 5
- ganado: 4 (fechas de cierre en los últimos 60 días)
- perdido: 2 (con motivo_perdida: "precio" o "competidor")

Valores entre $15,000 y $850,000 USD. Distribuidas entre todos los vendedores. Fechas de creación entre hace 180 días y hoy. Fechas de cierre estimada entre 30 y 90 días en el futuro para las abiertas.

### Actividades (80)
Distribuidas entre las oportunidades. Al menos 2 actividades por oportunidad activa. Tipos variados: llamadas, reuniones, demos, propuestas enviadas.

### Notas (40)
Al menos 1 nota por oportunidad activa.

---

## 8. CONFIGURACIÓN DOCKER

### `docker-compose.yml`
```yaml
version: "3.9"

services:
  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-techdist}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-techdist_secret}
      POSTGRES_DB: ${POSTGRES_DB:-techdist_crm}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-techdist}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-techdist}:${POSTGRES_PASSWORD:-techdist_secret}@db:5432/${POSTGRES_DB:-techdist_crm}
      SECRET_KEY: ${SECRET_KEY:-super-secret-key-change-in-production}
      ACCESS_TOKEN_EXPIRE_MINUTES: ${ACCESS_TOKEN_EXPIRE_MINUTES:-480}
      ENVIRONMENT: ${ENVIRONMENT:-development}
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    command: >
      sh -c "alembic upgrade head &&
             python scripts/seed.py &&
             uvicorn app.main:app --host 0.0.0.0 --port 8000"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### `backend/Dockerfile`
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
```

### `frontend/Dockerfile`
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### `frontend/nginx.conf`
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /health {
        proxy_pass http://backend:8000/health;
    }
}
```

### `.env.example`
```
POSTGRES_USER=techdist
POSTGRES_PASSWORD=CHANGE_THIS
POSTGRES_DB=techdist_crm
SECRET_KEY=CHANGE_THIS_TO_A_RANDOM_64_CHAR_STRING
ACCESS_TOKEN_EXPIRE_MINUTES=480
ENVIRONMENT=production
```

---

## 9. TESTING (pytest) — Cobertura mínima obligatoria

Los tests deben cubrir los siguientes casos. Todos usan una base de datos de test en memoria o un PostgreSQL de test (configurable vía `TEST_DATABASE_URL`).

### `test_health.py`
- `GET /health` retorna 200 y `{ "status": "ok" }`

### `test_auth.py`
- Login con credenciales válidas → 200 + token JWT
- Login con contraseña inválida → 401
- Acceder a endpoint protegido sin token → 401
- Acceder a endpoint protegido con token válido → 200

### `test_oportunidades.py`
- Crear oportunidad → 201 + OportunidadSchema
- Listar oportunidades → 200 + paginación
- Obtener oportunidad por ID → 200
- Obtener oportunidad ID inexistente → 404
- Actualizar etapa a "ganado" → probabilidad == 100
- Actualizar etapa a "perdido" con motivo → probabilidad == 0
- Crear actividad en oportunidad → 201
- Crear nota en oportunidad → 201
- Eliminar oportunidad → 204 (verifica cascada en actividades y notas)

### `test_clientes.py`
- CRUD completo (crear, leer, actualizar, eliminar)
- Búsqueda por nombre parcial
- `GET /{id}/stats` retorna métricas correctas

### `test_dashboard.py`
- `GET /dashboard/summary` → campos obligatorios presentes y numéricos
- `GET /dashboard/pipeline-por-etapa` → lista con las 7 etapas
- `GET /dashboard/top-oportunidades` → ordenadas por valor DESC
- `GET /dashboard/forecast?periodo=mes` → campos fecha_inicio, fecha_fin presentes
- `GET /dashboard/win-loss-trend?meses=3` → lista de 3 elementos

### `test_forecast.py`
- pipeline_ponderado = suma(valor * probabilidad/100) para oportunidades abiertas
- win_rate = ganadas/(ganadas+perdidas) × 100 en el periodo

---

## 10. ARCHIVO PSEC DE REFERENCIA

Crear en `psec/slice_base.yaml`:

```yaml
# Product Slice Execution Contract (PSEC) — TechDist CRM Base
# Uso: referencia para pruebas DSH. Este archivo define los contratos
# de ejecución para el Quality Harness automatizado.

slice_id: "TDCRM-SL-BASE"
version: "1.0.0"
objective: >
  Construir y desplegar la aplicación base TechDist CRM (FastAPI + PostgreSQL + React)
  con todos los endpoints de API definidos, cobertura de tests >= 80%, y 
  datos sintéticos de seed funcionales.

acceptance_criteria:
  - "GET /health retorna HTTP 200 con body { status: ok }"
  - "POST /api/v1/auth/login retorna JWT válido con credenciales correctas"
  - "GET /api/v1/dashboard/summary retorna pipeline_total_usd como número >= 0"
  - "GET /api/v1/oportunidades retorna lista paginada con campo items y total"
  - "PATCH /api/v1/oportunidades/{id}/etapa con etapa=ganado fuerza probabilidad=100"
  - "pytest --tb=short sale con 0 fallos"
  - "docker compose up --build finaliza sin errores"
  - "Frontend accesible en http://localhost:3000 con página de login visible"

allowed_tools:
  - fs_read
  - fs_write
  - shell_sandbox  # limitado a: pytest, docker compose, npm, pip
  - db_query       # solo lectura para verificación de seed

budgets:
  max_loops: 5
  inference_budget_usd: 3.00
  max_execution_time_minutes: 30

mandatory_tests:
  framework: pytest
  min_coverage_percent: 80
  mutation_score_threshold: null   # no aplicar mutation testing en slice inicial
  required_test_files:
    - tests/test_health.py
    - tests/test_auth.py
    - tests/test_oportunidades.py
    - tests/test_clientes.py
    - tests/test_dashboard.py

human_gate:
  required: true
  reviewer_role: "Arquitecto o Dev Senior"
  max_review_time_minutes: 15
  gate_criteria:
    - "Evidence Package generado (logs de pytest + docker compose up)"
    - "Seed data visible en /api/v1/dashboard/summary (pipeline > 0)"
    - "Sin credenciales hardcodeadas en código fuente"

deployment_cond:
  health_endpoint: "/health"
  expected_http_status: 200
  startup_timeout_seconds: 60

rollback_cond:
  trigger: "health_endpoint returns non-200 after 3 consecutive checks"
  action: "revert to previous image tag"

finops:
  track_inference_cost: true
  track_human_time: true
  alert_on_budget_exceed: true
```

---

## 11. README.md OBLIGATORIO

El README debe incluir:

```markdown
# TechDist CRM

Sistema de administración de oportunidades comerciales para empresas de distribución de tecnología.

## Stack
- **Backend:** FastAPI + SQLAlchemy + Alembic + PostgreSQL
- **Frontend:** React + Vite + Tailwind CSS + Recharts
- **Infraestructura:** Docker + Docker Compose

## Inicio Rápido

\```bash
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
\```

## Credenciales de demo
| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@techdist.mx | Techdist2025! | Admin |
| juan.garcia@techdist.mx | Techdist2025! | Vendedor |
| director@techdist.mx | Techdist2025! | Viewer (solo lectura) |

## Ejecutar tests
\```bash
cd backend
pip install -r requirements.txt
pytest --tb=short -v
\```

## Endpoints principales
- `GET  /health` — Estado del sistema
- `POST /api/v1/auth/login` — Autenticación
- `GET  /api/v1/dashboard/summary` — KPIs ejecutivos
- `GET  /api/v1/oportunidades` — Pipeline completo
- `GET  /api/v1/dashboard/forecast` — Forecast por periodo

## Contexto DSH
Este repositorio es la aplicación base para pruebas con DeepSeek Harness (EXP-06-06).
El archivo `psec/slice_base.yaml` define el contrato de ejecución del Quality Harness.
```

---

## 12. CRITERIOS DE ACEPTACIÓN FINALES (VERIFICAR ANTES DEL COMMIT)

Antes de hacer `git push`, verifica que **todos** estos puntos sean verdaderos:

- [ ] `docker compose up --build` termina sin errores y todos los servicios quedan `healthy`
- [ ] `curl http://localhost:8000/health` retorna `{"status":"ok",...}`
- [ ] `curl http://localhost:3000` retorna HTML con página de login
- [ ] `curl -X POST http://localhost:8000/api/v1/auth/login -d '{"email":"admin@techdist.mx","password":"Techdist2025!"}' -H "Content-Type: application/json"` retorna un JWT
- [ ] `curl http://localhost:8000/api/v1/dashboard/summary -H "Authorization: Bearer <TOKEN>"` retorna `pipeline_total_usd > 0` (confirma que el seed corrió)
- [ ] `pytest tests/ --tb=short` desde `/backend` sale con **0 fallos**
- [ ] No existe ningún archivo `.env` con valores reales en el commit (solo `.env.example`)
- [ ] El archivo `psec/slice_base.yaml` existe en el repositorio

---

## 13. INSTRUCCIÓN DE GIT

```bash
git add -A
git commit -m "feat: initial TechDist CRM application

- FastAPI backend with full CRUD for Oportunidades, Clientes, Contactos,
  Fabricantes, Productos, Actividades, Notas
- Executive dashboard KPIs: pipeline summary, funnel, forecast, win/loss trend
- React + Vite + Tailwind frontend with Kanban pipeline and CEO dashboard
- Docker Compose with PostgreSQL, backend, and nginx-served frontend
- Alembic migrations and synthetic seed data (40 opportunities, 15 clients)
- pytest test suite covering auth, CRUD, and dashboard endpoints
- PSEC slice_base.yaml for DSH Quality Harness integration"

git push origin main
```

---

*Fin del Prompt Maestro — TechDist CRM v1.0*  
*Generado en el contexto del Venture Studio AI-First · Fase 6 EXP-06-06*
