from pydantic import BaseModel, Field


class ConfigAlertaItem(BaseModel):
    departamento_id: int
    ativo: bool


class ConfigAlertaResponse(BaseModel):
    departamento_id: int
    descricao: str
    ativo: bool


class ConfigTipoAlertaSchema(BaseModel):
    alteracao_preco: bool
    estoque_minimo: bool
    sem_movimentacao: bool

    percentual_alteracao_preco: float = Field(
        default=10.0,
        ge=0,
        le=100,
    )

    quantidade_minima_estoque: float = Field(
        default=20.0,
        ge=0,
    )

    dias_sem_venda: int = Field(
        default=30,
        ge=1,
    )
