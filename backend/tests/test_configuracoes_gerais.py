import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.database import Base
from app.models import Loja, Usuario
from app.modules.auth.security import criar_token, exigir_administrador, get_current_user, verificar_senha
from app.modules.configuracoes.router import (
    atualizar_empresa, atualizar_permissao, atualizar_usuario, cadastrar_empresa, cadastrar_usuario,
)
from app.modules.configuracoes.schemas import (
    EmpresaCadastro, EmpresaEdicao, PermissaoEdicao, UsuarioCadastro, UsuarioEdicao,
)


@pytest.fixture
def db():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    with Session(engine) as sessao:
        sessao.add(Usuario(id=1, nome="Administrador", email="admin@example.com", senha_hash="hash", administrador=True))
        sessao.add(Loja(id=3, codigo="003", nome="Empresa", unidade="Matriz"))
        sessao.commit()
        yield sessao
    engine.dispose()


def test_empresas_cadastram_atualizam_e_mantem_uma_loja_operacional(db):
    dados = EmpresaCadastro(codigo="004", nome="Empresa", unidade="Filial")
    filial = cadastrar_empresa(dados, db)
    assert filial.id > 3 and filial.ativo
    with pytest.raises(HTTPException) as duplicada:
        cadastrar_empresa(dados, db)
    assert duplicada.value.status_code == 409

    inativa = EmpresaEdicao(nome="Empresa", unidade="Filial", ativo=False)
    assert not atualizar_empresa(filial.id, inativa, db).ativo
    with pytest.raises(HTTPException) as ultima:
        atualizar_empresa(3, EmpresaEdicao(nome="Empresa", unidade="Matriz", ativo=False), db)
    assert ultima.value.status_code == 409
    assert atualizar_empresa(3, EmpresaEdicao(nome="Empresa", unidade="Matriz renovada"), db).codigo == "003"


def test_perfis_e_desativacao_valem_para_tokens_ja_emitidos(db):
    admin = db.get(Usuario, 1)
    operador = cadastrar_usuario(
        UsuarioCadastro(nome="Operador", email="operador@example.com", senha="ExemploSenha!"), db, admin,
    )
    token = criar_token({"id": operador.id, "sub": operador.email, "administrador": False})
    assert verificar_senha("ExemploSenha!", operador.senha_hash)
    with pytest.raises(HTTPException) as negado:
        exigir_administrador(get_current_user(token, db))
    assert negado.value.status_code == 403

    atualizar_permissao(operador.id, PermissaoEdicao(administrador=True), db, admin)
    assert exigir_administrador(get_current_user(token, db)).id == operador.id
    atualizar_usuario(operador.id, UsuarioEdicao(nome="Operador", email="novo@example.com", ativo=False), db, admin)
    with pytest.raises(HTTPException) as desativado:
        get_current_user(token, db)
    assert desativado.value.status_code == 401

    with pytest.raises(HTTPException, match="própria conta"):
        atualizar_permissao(admin.id, PermissaoEdicao(administrador=False), db, admin)
    with pytest.raises(HTTPException, match="própria conta"):
        atualizar_usuario(admin.id, UsuarioEdicao(nome=admin.nome, email=admin.email, ativo=False), db, admin)


def test_token_continua_vinculado_ao_id_quando_email_muda(db):
    admin = db.get(Usuario, 1)
    token = criar_token({"id": admin.id, "sub": admin.email})
    atualizar_usuario(admin.id, UsuarioEdicao(nome=admin.nome, email="novo-admin@example.com"), db, admin)
    db.add(Usuario(nome="Outra conta", email="admin@example.com", senha_hash="hash"))
    db.commit()
    assert get_current_user(token, db).id == admin.id
