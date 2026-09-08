"""cria estrutura de lojas

Revision ID: 9f2c7a1d4b6e
Revises: 804091f2096d
Create Date: 2026-09-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9f2c7a1d4b6e"
down_revision: Union[str, Sequence[str], None] = "804091f2096d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Cadastro central de lojas
    op.create_table(
        "lojas",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("codigo", sa.String(10), nullable=False, unique=True),
        sa.Column("nome", sa.String(100), nullable=False),
        sa.Column("unidade", sa.String(100), nullable=False),
        sa.Column(
            "ativo",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
    )

    # 2. Lojas existentes
    op.bulk_insert(
        sa.table(
            "lojas",
            sa.column("id", sa.Integer()),
            sa.column("codigo", sa.String()),
            sa.column("nome", sa.String()),
            sa.column("unidade", sa.String()),
            sa.column("ativo", sa.Boolean()),
        ),
        [
            {
                "id": 1,
                "codigo": "001",
                "nome": "Comercial Bigus",
                "unidade": "Morro do Algodão",
                "ativo": True,
            },
            {
                "id": 2,
                "codigo": "002",
                "nome": "Comercial Bigus 2",
                "unidade": "Barranco Alto",
                "ativo": True,
            },
            {
                "id": 3,
                "codigo": "003",
                "nome": "Comecial Peck",
                "unidade": "Pereque Mirim",
                "ativo": True,
            },
        ],
    )

    # 3. Associação de vendas com loja
    op.add_column(
        "vendas",
        sa.Column("loja_id", sa.Integer(), nullable=True),
    )

    op.create_foreign_key(
        "vendas_loja_id_fkey",
        "vendas",
        "lojas",
        ["loja_id"],
        ["id"],
    )

    op.execute(
        """
        UPDATE vendas
        SET loja_id = 1
        WHERE empresa = 'LOJA 1'
        """
    )

    # 4. Associação de entradas com loja
    op.add_column(
        "entradas",
        sa.Column("loja_id", sa.Integer(), nullable=True),
    )

    op.create_foreign_key(
        "entradas_loja_id_fkey",
        "entradas",
        "lojas",
        ["loja_id"],
        ["id"],
    )

    op.execute(
        """
        UPDATE entradas
        SET loja_id = empresa
        WHERE empresa IN (1, 2, 3)
        """
    )

    # 5. Histórico de importações
    op.add_column(
        "historico_importacao",
        sa.Column("loja_id", sa.Integer(), nullable=True),
    )

    op.create_foreign_key(
        "historico_importacao_loja_id_fkey",
        "historico_importacao",
        "lojas",
        ["loja_id"],
        ["id"],
    )

    # Os históricos atuais correspondem aos dados da Loja 1.
    op.execute(
        """
        UPDATE historico_importacao
        SET loja_id = 1
        WHERE loja_id IS NULL
        """
    )

    # 6. Configurações de alerta
    op.add_column(
        "config_alertas",
        sa.Column("loja_id", sa.Integer(), nullable=True),
    )

    op.create_foreign_key(
        "config_alertas_loja_id_fkey",
        "config_alertas",
        "lojas",
        ["loja_id"],
        ["id"],
    )

    # Configurações existentes pertencem à Loja 1.
    op.execute(
        """
        UPDATE config_alertas
        SET loja_id = 1
        WHERE loja_id IS NULL
        """
    )


def downgrade() -> None:
    op.drop_constraint(
        "config_alertas_loja_id_fkey",
        "config_alertas",
        type_="foreignkey",
    )
    op.drop_column("config_alertas", "loja_id")

    op.drop_constraint(
        "historico_importacao_loja_id_fkey",
        "historico_importacao",
        type_="foreignkey",
    )
    op.drop_column("historico_importacao", "loja_id")

    op.drop_constraint(
        "entradas_loja_id_fkey",
        "entradas",
        type_="foreignkey",
    )
    op.drop_column("entradas", "loja_id")

    op.drop_constraint(
        "vendas_loja_id_fkey",
        "vendas",
        type_="foreignkey",
    )
    op.drop_column("vendas", "loja_id")

    op.drop_table("lojas")
