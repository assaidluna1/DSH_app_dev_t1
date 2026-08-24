"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2025-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users
    op.create_table(
        'users',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('rol', sa.String(length=20), nullable=False, server_default='vendedor'),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # clientes
    op.create_table(
        'clientes',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('nombre', sa.String(length=200), nullable=False),
        sa.Column('industria', sa.String(length=100), nullable=True),
        sa.Column('num_empleados', sa.Integer(), nullable=True),
        sa.Column('ciudad', sa.String(length=100), nullable=True),
        sa.Column('pais', sa.String(length=100), nullable=False, server_default='México'),
        sa.Column('segmento', sa.String(length=50), nullable=False, server_default='SMB'),
        sa.Column('website', sa.String(length=200), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_clientes_nombre'), 'clientes', ['nombre'], unique=False)

    # contactos
    op.create_table(
        'contactos',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('cliente_id', sa.Uuid(), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('apellido', sa.String(length=100), nullable=True),
        sa.Column('cargo', sa.String(length=150), nullable=True),
        sa.Column('email', sa.String(length=150), nullable=True),
        sa.Column('telefono', sa.String(length=30), nullable=True),
        sa.Column('es_decision_maker', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_contactos_cliente_id'), 'contactos', ['cliente_id'], unique=False)

    # fabricantes
    op.create_table(
        'fabricantes',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('nombre', sa.String(length=150), nullable=False),
        sa.Column('categoria', sa.String(length=100), nullable=True),
        sa.Column('logo_url', sa.String(length=300), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default='true'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_fabricantes_nombre'), 'fabricantes', ['nombre'], unique=True)

    # productos
    op.create_table(
        'productos',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('fabricante_id', sa.Uuid(), nullable=False),
        sa.Column('nombre', sa.String(length=200), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('categoria', sa.String(length=100), nullable=True),
        sa.Column('precio_lista_usd', sa.Numeric(precision=15, scale=2), nullable=False, server_default='0.00'),
        sa.Column('sku', sa.String(length=100), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default='true'),
        sa.ForeignKeyConstraint(['fabricante_id'], ['fabricantes.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_productos_fabricante_id'), 'productos', ['fabricante_id'], unique=False)
    op.create_index(op.f('ix_productos_nombre'), 'productos', ['nombre'], unique=False)
    op.create_index(op.f('ix_productos_sku'), 'productos', ['sku'], unique=False)

    # oportunidades
    op.create_table(
        'oportunidades',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('nombre', sa.String(length=300), nullable=False),
        sa.Column('cliente_id', sa.Uuid(), nullable=False),
        sa.Column('propietario_id', sa.Uuid(), nullable=False),
        sa.Column('contacto_principal_id', sa.Uuid(), nullable=True),
        sa.Column('etapa', sa.String(length=50), nullable=False, server_default='prospeccion'),
        sa.Column('valor_estimado_usd', sa.Numeric(precision=15, scale=2), nullable=False, server_default='0.00'),
        sa.Column('probabilidad', sa.Numeric(precision=5, scale=2), nullable=False, server_default='10.00'),
        sa.Column('fecha_cierre_estimada', sa.Date(), nullable=True),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('origen', sa.String(length=50), nullable=True),
        sa.Column('prioridad', sa.String(length=20), nullable=False, server_default='media'),
        sa.Column('motivo_perdida', sa.String(length=300), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id']),
        sa.ForeignKeyConstraint(['propietario_id'], ['users.id']),
        sa.ForeignKeyConstraint(['contacto_principal_id'], ['contactos.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_oportunidades_cliente_id'), 'oportunidades', ['cliente_id'], unique=False)
    op.create_index(op.f('ix_oportunidades_contacto_principal_id'), 'oportunidades', ['contacto_principal_id'], unique=False)
    op.create_index(op.f('ix_oportunidades_etapa'), 'oportunidades', ['etapa'], unique=False)
    op.create_index(op.f('ix_oportunidades_nombre'), 'oportunidades', ['nombre'], unique=False)
    op.create_index(op.f('ix_oportunidades_propietario_id'), 'oportunidades', ['propietario_id'], unique=False)

    # oportunidad_productos
    op.create_table(
        'oportunidad_productos',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('oportunidad_id', sa.Uuid(), nullable=False),
        sa.Column('producto_id', sa.Uuid(), nullable=False),
        sa.Column('cantidad', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('precio_unitario_usd', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.ForeignKeyConstraint(['oportunidad_id'], ['oportunidades.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['producto_id'], ['productos.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_oportunidad_productos_oportunidad_id'), 'oportunidad_productos', ['oportunidad_id'], unique=False)
    op.create_index(op.f('ix_oportunidad_productos_producto_id'), 'oportunidad_productos', ['producto_id'], unique=False)

    # actividades
    op.create_table(
        'actividades',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('oportunidad_id', sa.Uuid(), nullable=False),
        sa.Column('usuario_id', sa.Uuid(), nullable=False),
        sa.Column('tipo', sa.String(length=50), nullable=False),
        sa.Column('titulo', sa.String(length=300), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('fecha', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('duracion_min', sa.Integer(), nullable=True),
        sa.Column('resultado', sa.String(length=300), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['oportunidad_id'], ['oportunidades.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['usuario_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_actividades_oportunidad_id'), 'actividades', ['oportunidad_id'], unique=False)
    op.create_index(op.f('ix_actividades_usuario_id'), 'actividades', ['usuario_id'], unique=False)

    # notas
    op.create_table(
        'notas',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('oportunidad_id', sa.Uuid(), nullable=False),
        sa.Column('usuario_id', sa.Uuid(), nullable=False),
        sa.Column('contenido', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['oportunidad_id'], ['oportunidades.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['usuario_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_notas_oportunidad_id'), 'notas', ['oportunidad_id'], unique=False)
    op.create_index(op.f('ix_notas_usuario_id'), 'notas', ['usuario_id'], unique=False)


def downgrade() -> None:
    op.drop_table('notas')
    op.drop_table('actividades')
    op.drop_table('oportunidad_productos')
    op.drop_table('oportunidades')
    op.drop_table('productos')
    op.drop_table('fabricantes')
    op.drop_table('contactos')
    op.drop_table('clientes')
    op.drop_table('users')
