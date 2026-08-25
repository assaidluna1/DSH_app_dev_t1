"""add cotizaciones table

Revision ID: 003_cotizaciones
Revises: 002_canal_origen
Create Date: 2026-08-24 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '003_cotizaciones'
down_revision = '002_canal_origen'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'cotizaciones',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('oportunidad_id', sa.Uuid(), nullable=False),
        sa.Column('numero', sa.String(length=50), nullable=False),
        sa.Column('subtotal_usd', sa.Numeric(precision=15, scale=2), nullable=False, server_default='0.00'),
        sa.Column('descuento_pct', sa.Numeric(precision=5, scale=2), nullable=False, server_default='0.00'),
        sa.Column('total_usd', sa.Numeric(precision=15, scale=2), nullable=False, server_default='0.00'),
        sa.Column('estado', sa.String(length=20), nullable=False, server_default='borrador'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['oportunidad_id'], ['oportunidades.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_cotizaciones_numero'), 'cotizaciones', ['numero'], unique=True)
    op.create_index(op.f('ix_cotizaciones_oportunidad_id'), 'cotizaciones', ['oportunidad_id'], unique=False)
    op.create_index(op.f('ix_cotizaciones_estado'), 'cotizaciones', ['estado'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_cotizaciones_estado'), table_name='cotizaciones')
    op.drop_index(op.f('ix_coportunidad_id'), table_name='cotizaciones')
    op.drop_index(op.f('ix_cotizaciones_numero'), table_name='cotizaciones')
    op.drop_table('cotizaciones')
