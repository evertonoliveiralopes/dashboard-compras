from decimal import Decimal
from io import BytesIO

import pytest
from fastapi import HTTPException, UploadFile
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.database import Base
from app.models import HistoricoImportacao, Loja, Produto, ProdutoLoja
from app.modules.produtos.service import ProdutoService


CABECALHO = "Código;Descrição;EAN;Estoque Atual;Preço Venda;Código;Estoque Atual Troca;Custo"


@pytest.fixture
def db():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    with Session(engine) as sessao:
        sessao.add_all([Loja(id=id, codigo=str(id), nome="Loja", unidade=str(id)) for id in (1, 2)])
        sessao.commit()
        yield sessao
    engine.dispose()


def importar(db, *linhas, loja=1, cabecalho=CABECALHO):
    conteudo = "\n".join((cabecalho, *linhas)).encode("utf-8-sig")
    upload = UploadFile(file=BytesIO(conteudo), filename="produtos.csv")
    return ProdutoService().importar(upload, db, loja)


def test_recupera_descricao_desalinhada_sem_mudar_o_saldo_por_loja(db):
    resultado = importar(
        db,
        "001;Produto;com separador;7899632523994;1.234,567;7,99;22;-0,125;4,50",
        ';Quantidade de registros: 1',
    )
    assert resultado == {"inseridos": 1, "atualizados": 0}
    assert db.query(HistoricoImportacao).one().registros == 1
    assert db.query(Produto.codigo, Produto.descricao).one() == ("1", "Produto;com separador")

    importar(db, '001;"Produto;com separador";7899632523994;2.750;7.99;22;0;4.50', loja=2)
    importar(db, '001;"Produto;com separador";7899632523994;-4,125;7,99;22;1,000;4,50')

    saldos = db.query(ProdutoLoja).order_by(ProdutoLoja.loja_id).all()
    assert [(item.estoque_atual, item.estoque_trocas) for item in saldos] == [
        (Decimal("-4.125"), Decimal("1.000")),
        (Decimal("2.750"), Decimal("0.000")),
    ]
    assert saldos[1].custo == Decimal("4.50")


def test_arquivo_sem_coluna_de_estoque_e_rejeitado(db):
    with pytest.raises(HTTPException, match="Estoque Atual") as erro:
        importar(db, "1;Produto;4,50", cabecalho="Código;Descrição;Custo")
    assert erro.value.status_code == 422
    assert db.query(ProdutoLoja).count() == db.query(HistoricoImportacao).count() == 0


def test_saldo_invalido_no_segundo_lote_desfaz_o_primeiro(db):
    linhas = [f"{codigo};Produto;7899632523994;1,50;7,99;22;0;4,50" for codigo in range(1, 1001)]
    linhas.append("1001;Produto;7899632523994;inválido;7,99;22;0;4,50")
    with pytest.raises(HTTPException, match="Estoque Atual inválido para o produto 1001") as erro:
        importar(db, *linhas)
    assert erro.value.status_code == 422
    assert db.query(Produto).count() == db.query(ProdutoLoja).count() == db.query(HistoricoImportacao).count() == 0
