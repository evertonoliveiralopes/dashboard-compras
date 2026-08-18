from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProdutoResponse(BaseModel):

    id: int
    codigo: str
    descricao: str
    departamento: str | None = None
    custo: Decimal
    preco_venda: Decimal
    estoque: Decimal
    status: int

    model_config = ConfigDict(
        from_attributes=True
    )