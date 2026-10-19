"""Adiciona parametros configuraveis de alertas.

Revision ID: 191127f58bc6
Revises: 7a4e91c2d8f0
"""

from alembic import op
import sqlalchemy as sa


revision = "191127f58bc6"
down_revision = "7a4e91c2d8f0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "config_tipos_alertas",
        sa.Column(
            "percentual_alteracao_preco",
            sa.Numeric(5, 2),
            nullable=False,
            server_default="10.00",
        ),
    )

    op.add_column(
        "config_tipos_alertas",
        sa.Column(
            "quantidade_minima_estoque",
            sa.Numeric(10, 3),
            nullable=False,
            server_default="20.000",
        ),
    )

    op.add_column(
        "config_tipos_alertas",
        sa.Column(
            "dias_sem_venda",
            sa.Integer(),
            nullable=False,
            server_default="30",
        ),
    )


def downgrade() -> None:
    op.drop_column("config_tipos_alertas", "dias_sem_venda")
    op.drop_column("config_tipos_alertas", "quantidade_minima_estoque")
    op.drop_column("config_tipos_alertas", "percentual_alteracao_preco")
