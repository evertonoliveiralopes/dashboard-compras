"""cria_tabela_config_alertas

Revision ID: f6c08d4eabde
Revises: d1627198f285
Create Date: 2026-08-06 09:47:58.860715

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f6c08d4eabde'
down_revision: Union[str, Sequence[str], None] = 'd1627198f285'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():

    op.create_table(
        "config_alertas",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
        ),

        sa.Column(
            "usuario_id",
            sa.Integer(),
            sa.ForeignKey("usuarios.id"),
            nullable=False,
        ),

        sa.Column(
            "departamento_id",
            sa.Integer(),
            sa.ForeignKey("departamentos.id"),
            nullable=False,
        ),

        sa.Column(
            "ativo",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
    )


def downgrade():

    op.drop_table("config_alertas")