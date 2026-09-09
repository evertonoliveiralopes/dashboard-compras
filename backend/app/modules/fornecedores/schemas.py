from pydantic import BaseModel


class FornecedorResponse(BaseModel):

    id: int
    codigo: str
    razao_social: str
    nome_fantasia: str | None = None
    cnpj: str | None = None
    telefone: str | None = None
    email: str | None = None
    ativo: bool


class FornecedoresPaginadosResponse(BaseModel):

    items: list[FornecedorResponse]
    total: int