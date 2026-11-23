from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.loja import Loja
from app.models.usuario import Usuario
from app.modules.auth.schemas import UsuarioResponse
from app.modules.auth.security import exigir_administrador, gerar_hash_senha

from .schemas import EmpresaCadastro, EmpresaEdicao, EmpresaResposta, PermissaoEdicao, UsuarioCadastro, UsuarioEdicao


router = APIRouter(
    prefix="/configuracoes",
    tags=["Configurações gerais"],
    dependencies=[Depends(exigir_administrador)],
)


def bloquear_edicao_empresas(db):
    if db.get_bind().dialect.name == "postgresql":
        db.execute(text("LOCK TABLE lojas IN SHARE ROW EXCLUSIVE MODE"))


def salvar_registro(db, registro, mensagem_duplicidade):
    try:
        db.commit()
    except IntegrityError as erro:
        db.rollback()
        raise HTTPException(409, mensagem_duplicidade) from erro
    return registro


@router.get("/empresas", response_model=list[EmpresaResposta])
def listar_empresas(db: Session = Depends(get_db)):
    return db.scalars(select(Loja).order_by(Loja.id)).all()


@router.post("/empresas", response_model=EmpresaResposta, status_code=201)
def cadastrar_empresa(dados: EmpresaCadastro, db: Session = Depends(get_db)):
    bloquear_edicao_empresas(db)
    if db.scalar(select(Loja.id).where(Loja.codigo == dados.codigo)) is not None:
        raise HTTPException(409, "Já existe uma empresa com esse código.")
    loja_id = None
    if db.get_bind().dialect.name == "postgresql":
        # O cadastro original inseriu as três primeiras lojas com IDs fixos.
        loja_id = db.scalar(text("""
            SELECT setval(
                cast(pg_get_serial_sequence('lojas', 'id') AS regclass),
                greatest(
                    coalesce((SELECT max(id) + 1 FROM lojas), 1),
                    nextval(cast(pg_get_serial_sequence('lojas', 'id') AS regclass))
                )
            )
        """))
    loja = Loja(id=loja_id, **dados.model_dump())
    db.add(loja)
    return salvar_registro(db, loja, "Já existe uma empresa com esse código.")


@router.put("/empresas/{empresa_id}", response_model=EmpresaResposta)
def atualizar_empresa(empresa_id: int, dados: EmpresaEdicao, db: Session = Depends(get_db)):
    bloquear_edicao_empresas(db)
    loja = db.get(Loja, empresa_id)
    if loja is None:
        raise HTTPException(404, "Empresa não encontrada.")
    if loja.ativo and not dados.ativo and db.scalar(select(func.count()).select_from(Loja).where(Loja.ativo)) == 1:
        raise HTTPException(409, "Mantenha pelo menos uma empresa ativa para selecionar uma loja no sistema.")
    loja.nome = dados.nome
    loja.unidade = dados.unidade
    loja.ativo = dados.ativo
    db.commit()
    return loja


@router.get("/usuarios", response_model=list[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.scalars(select(Usuario).order_by(func.lower(Usuario.nome), Usuario.id)).all()


def confirmar_admin_ativo(db, administrador):
    # Serializa alterações de conta e verifica o perfil novamente após obter os bloqueios.
    ativos = db.scalars(
        select(Usuario.id).where(Usuario.ativo, Usuario.administrador).order_by(Usuario.id).with_for_update()
    ).all()
    if administrador.id not in ativos:
        raise HTTPException(403, "Esta área é restrita a administradores ativos.")


def verificar_email(db, email, usuario_id=None):
    consulta = select(Usuario.id).where(func.lower(Usuario.email) == email.lower())
    if usuario_id is not None:
        consulta = consulta.where(Usuario.id != usuario_id)
    if db.scalar(consulta) is not None:
        raise HTTPException(409, "Já existe um usuário com esse e-mail.")


@router.post("/usuarios", response_model=UsuarioResponse, status_code=201)
def cadastrar_usuario(
    dados: UsuarioCadastro,
    db: Session = Depends(get_db),
    administrador: Usuario = Depends(exigir_administrador),
):
    confirmar_admin_ativo(db, administrador)
    verificar_email(db, dados.email)
    usuario = Usuario(
        nome=dados.nome, email=dados.email, ativo=dados.ativo, administrador=False,
        senha_hash=gerar_hash_senha(dados.senha.get_secret_value()),
    )
    db.add(usuario)
    return salvar_registro(db, usuario, "Já existe um usuário com esse e-mail.")


@router.put("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def atualizar_usuario(
    usuario_id: int,
    dados: UsuarioEdicao,
    db: Session = Depends(get_db),
    administrador: Usuario = Depends(exigir_administrador),
):
    confirmar_admin_ativo(db, administrador)
    usuario = db.get(Usuario, usuario_id)
    if usuario is None:
        raise HTTPException(404, "Usuário não encontrado.")
    if usuario_id == administrador.id and not dados.ativo:
        raise HTTPException(409, "Você não pode desativar a própria conta.")
    verificar_email(db, dados.email, usuario_id)
    usuario.nome = dados.nome
    usuario.email = dados.email
    usuario.ativo = dados.ativo
    return salvar_registro(db, usuario, "Já existe um usuário com esse e-mail.")


@router.put("/usuarios/{usuario_id}/permissao", response_model=UsuarioResponse)
def atualizar_permissao(
    usuario_id: int,
    dados: PermissaoEdicao,
    db: Session = Depends(get_db),
    administrador: Usuario = Depends(exigir_administrador),
):
    confirmar_admin_ativo(db, administrador)
    usuario = db.get(Usuario, usuario_id)
    if usuario is None:
        raise HTTPException(404, "Usuário não encontrado.")
    if usuario_id == administrador.id and not dados.administrador:
        raise HTTPException(409, "Você não pode remover o perfil de administrador da própria conta.")
    usuario.administrador = dados.administrador
    db.commit()
    return usuario
