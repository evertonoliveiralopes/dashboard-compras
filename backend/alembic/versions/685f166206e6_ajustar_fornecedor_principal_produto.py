"""ajustar_fornecedor_principal_produto

Revision ID: 685f166206e6
Revises: 202eeb37a619
Create Date: 2026-07-14 16:30:23.328414

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '685f166206e6'
down_revision: Union[str, Sequence[str], None] = '202eeb37a619'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint(
        'produtos_fornecedor_id_fkey',
        'produtos',
        type_='foreignkey'
    )

    op.alter_column(
        'produtos',
        'fornecedor_id',
        new_column_name='fornecedor_principal_id'
    )

    op.create_foreign_key(
        'produtos_fornecedor_principal_id_fkey',
        'produtos',
        'fornecedores',
        ['fornecedor_principal_id'],
        ['id']
    )

def downgrade() -> None:
    op.drop_constraint(
        'produtos_fornecedor_principal_id_fkey',
        'produtos',
        type_='foreignkey'
    )

    op.alter_column(
        'produtos',
        'fornecedor_principal_id',
        new_column_name='fornecedor_id'
    )

    op.create_foreign_key(
        'produtos_fornecedor_id_fkey',
        'produtos',
        'fornecedores',
        ['fornecedor_id'],
        ['id']
    )