"""cria dados de produtos por loja

Revision ID: 7a4e91c2d8f0
Revises: 9f2c7a1d4b6e
Create Date: 2026-09-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7a4e91c2d8f0"
down_revision: Union[str, Sequence[str], None] = "9f2c7a1d4b6e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "produtos_lojas",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "produto_id",
            sa.Integer(),
            sa.ForeignKey("produtos.id"),
            nullable=False,
        ),
        sa.Column(
            "loja_id",
            sa.Integer(),
            sa.ForeignKey("lojas.id"),
            nullable=False,
        ),
        sa.Column(
            "custo",
            sa.Numeric(10, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "preco_venda",
            sa.Numeric(10, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "estoque_atual",
            sa.Numeric(10, 3),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "estoque_trocas",
            sa.Numeric(10, 3),
            nullable=False,
            server_default="0",
        ),
        sa.UniqueConstraint(
            "produto_id",
            "loja_id",
            name="uq_produtos_lojas_produto_loja",
        ),
    )

    op.execute(
        """
        INSERT INTO produtos_lojas (
            produto_id,
            loja_id,
            custo,
            preco_venda,
            estoque_atual,
            estoque_trocas
        )
        SELECT
            id,
            1,
            COALESCE(custo, 0),
            COALESCE(preco_venda, 0),
            COALESCE(estoque, 0),
            0
        FROM produtos
        """
    )


def downgrade() -> None:
    op.drop_table("produtos_lojas")
