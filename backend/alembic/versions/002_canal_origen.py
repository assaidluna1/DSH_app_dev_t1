"""add canal_origen to oportunidades

Revision ID: 002_canal_origen
Revises: 001_initial_schema
Create Date: 2026-08-24 19:25:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_canal_origen'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'oportunidades',
        sa.Column('canal_origen', sa.String(length=20), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('oportunidades', 'canal_origen')
