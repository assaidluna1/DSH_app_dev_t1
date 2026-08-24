import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.dependencies import get_db
from app.main import app
from app.models.user import User
from app.models.fabricante import Fabricante
from app.models.producto import Producto
from app.models.cliente import Cliente
from app.models.contacto import Contacto
from app.models.oportunidad import Oportunidad
from app.models.actividad import Actividad
from app.models.nota import Nota
from app.security import get_password_hash, create_access_token

# Use SQLite in memory for lightning fast deterministic tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    
    # Create baseline admin and vendedor users
    admin = User(
        nombre="Admin Test",
        email="admin@techdist.mx",
        password_hash=get_password_hash("Techdist2025!"),
        rol="admin",
        activo=True,
    )
    vendedor = User(
        nombre="Vendedor Test",
        email="vendedor@techdist.mx",
        password_hash=get_password_hash("Techdist2025!"),
        rol="vendedor",
        activo=True,
    )
    session.add(admin)
    session.add(vendedor)
    session.commit()
    session.refresh(admin)
    session.refresh(vendedor)

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def admin_headers(db_session):
    admin = db_session.query(User).filter(User.email == "admin@techdist.mx").first()
    token = create_access_token(subject=str(admin.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def vendedor_headers(db_session):
    vendedor = db_session.query(User).filter(User.email == "vendedor@techdist.mx").first()
    token = create_access_token(subject=str(vendedor.id))
    return {"Authorization": f"Bearer {token}"}
