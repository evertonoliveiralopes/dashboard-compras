from pydantic import BaseModel


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