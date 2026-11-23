from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, SecretStr, StringConstraints, field_validator


NomeEmpresa = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
CodigoEmpresa = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=10)]


class EmpresaEdicao(BaseModel):
    nome: NomeEmpresa
    unidade: NomeEmpresa
    ativo: bool = True


class EmpresaCadastro(EmpresaEdicao):
    codigo: CodigoEmpresa


class EmpresaResposta(EmpresaCadastro):
    model_config = ConfigDict(from_attributes=True)

    id: int


class UsuarioEdicao(BaseModel):
    nome: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=150)]
    email: EmailStr
    ativo: bool = True

    @field_validator("email")
    @classmethod
    def validar_email(cls, valor):
        if len(valor) > 150:
            raise ValueError("O e-mail deve ter até 150 caracteres.")
        return valor


class UsuarioCadastro(UsuarioEdicao):
    senha: SecretStr

    @field_validator("senha")
    @classmethod
    def validar_senha(cls, valor):
        senha = valor.get_secret_value()
        if len(senha) < 8 or len(senha.encode("utf-8")) > 72:
            raise ValueError("A senha deve ter pelo menos 8 caracteres e no máximo 72 bytes.")
        return valor


class PermissaoEdicao(BaseModel):
    administrador: bool
