from datetime import date, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.database import Base
from app.models import ConfigAlerta, ConfigTipoAlerta, Departamento, Loja, Produto, ProdutoLoja, Usuario, Venda
from app.modules.dashboard.router import alertas, alertas_com_exclusoes


def test_composicoes_sao_excluidas_de_cada_categoria_antes_do_limite():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        usuario = Usuario(id=1, nome="Comprador", email="teste@exemplo.com", senha_hash="teste")
        db.add_all([
            usuario,
            Departamento(id=1, codigo="A", descricao="Açougue"),
            Loja(id=1, codigo="1", nome="Loja 1", unidade="Matriz"),
            Loja(id=2, codigo="2", nome="Loja 2", unidade="Filial"),
            ConfigAlerta(usuario_id=1, departamento_id=1, ativo=True),
            ConfigTipoAlerta(usuario_id=1, estoque_minimo=True, sem_movimentacao=True, dias_sem_venda=7),
        ])
        for id in range(1, 15):
            db.add(Produto(id=id, codigo=str(id), descricao=f"Produto {id}", departamento="B" if id == 14 else "A"))
            db.add(ProdutoLoja(produto_id=id, loja_id=2 if id == 13 else 1, estoque_atual=0, custo=0))

        ultimo_dia = date(2026, 11, 18)
        db.add_all([
            Venda(empresa="1", loja_id=1, codigo_produto="99", quantidade=1, data=ultimo_dia - timedelta(days=7)),
            Venda(empresa="1", loja_id=1, codigo_produto="99", quantidade=1, data=ultimo_dia),
        ])
        db.commit()

        originais = alertas(loja_id=1, usuario=usuario, db=db)
        categorias = {"SEM_ESTOQUE", "SEM_CUSTO", "SEM_COMPRA", "SEM_VENDA"}
        assert {item["tipo"] for item in originais} == categorias
        marcados = {item["codigo_produto"] for item in originais[:2]}
        assert len(marcados) == 2

        filtrados = alertas_com_exclusoes(list(marcados), loja_id=1, usuario=usuario, db=db)
        codigos_esperados = {str(id) for id in range(1, 13)} - marcados
        for categoria in categorias:
            assert {item["codigo_produto"] for item in filtrados if item["tipo"] == categoria} == codigos_esperados

        restaurados = alertas_com_exclusoes([], loja_id=1, usuario=usuario, db=db)
        assert restaurados == originais
    engine.dispose()
