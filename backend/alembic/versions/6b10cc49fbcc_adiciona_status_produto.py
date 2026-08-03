"""adiciona status produto

Revision ID: 6b10cc49fbcc
Revises: 66b0a54eec0f
Create Date: 2026-07-24 09:46:02.898109

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6b10cc49fbcc'
down_revision: Union[str, Sequence[str], None] = '66b0a54eec0f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # Cria a coluna status
    op.add_column(
        "produtos",
        sa.Column(
            "status",
            sa.Integer(),
            nullable=False,
            server_default="0"
        )
    )

    # Remove o default do banco (o SQLAlchemy continuará controlando isso)
    op.alter_column(
        "produtos",
        "status",
        server_default=None
    )

    # Remove a coluna antiga
    op.drop_column("produtos", "ativo")


def downgrade() -> None:

    # Recria a coluna ativo
    op.add_column(
        "produtos",
        sa.Column(
            "ativo",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        )
    )

    # Converte o status novamente para ativo
    op.execute("""
        UPDATE produtos
           SET ativo =
               CASE
                   WHEN status = 0 THEN TRUE
                   ELSE FALSE
               END
    """)

    op.alter_column(
        "produtos",
        "ativo",
        server_default=None
    )

    op.drop_column("produtos", "status")