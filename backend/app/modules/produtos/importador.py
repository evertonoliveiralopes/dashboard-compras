import pandas as pd
from sqlalchemy.orm import Session
from app.utils.codigo_produto import normalizar_codigo_produto
from app.utils.normalizar_codigo import normalizar_codigo

from app.models.produto import Produto

def limpar_status(valor):

    if pd.isna(valor):
        return 0

    valor = str(valor).strip()

    if valor == "":
        return 0

    try:
        return int(valor.split("-")[0].strip())
    except:
        return 0


def limpar_texto(valor):
    if pd.isna(valor):
        return None

    valor = str(valor).strip()

    if valor == "" or valor.lower() == "nan":
        return None

    return valor


def limpar_codigo(valor):
    if pd.isna(valor):
        return None

    valor = str(valor).strip()

    if valor == "":
        return None

    return valor


def limpar_decimal(valor):
    if pd.isna(valor):
        return 0

    if isinstance(valor, (int, float)):
        return float(valor)

    valor = (
        str(valor)
        .replace(".", "")
        .replace(",", ".")
        .strip()
    )

    try:
        return float(valor)
    except:
        return 0


def importar_dataframe(df: pd.DataFrame, db: Session):

    inseridos = 0
    atualizados = 0

    for _, linha in df.iterrows():
        
        codigo = normalizar_codigo_produto(linha.get("Código"))

        if not codigo:
            continue

        descricao = limpar_texto(linha.get("Descrição"))

        departamento = normalizar_codigo(    linha.get("Depto."))

        estoque = limpar_decimal(linha.get("Estoque Atual"))

        custo = limpar_decimal(linha.get("Custo"))

        preco_venda = limpar_decimal(linha.get("Preço Venda"))

        status = limpar_status(linha.get("Status"))

        produto = (
            db.query(Produto)
            .filter(Produto.codigo == codigo)
            .first()
        )

        if produto:

            produto.descricao = descricao
            produto.departamento = departamento
            produto.estoque = estoque
            produto.custo = custo
            produto.preco_venda = preco_venda
            produto.status = status

            atualizados += 1

        else:

            novo_produto = Produto(

                codigo=codigo,
                descricao=descricao,
                departamento=departamento,

                custo=custo,
                preco_venda=preco_venda,

                estoque=estoque,
                estoque_minimo=0,

                status=status,

            )

            db.add(novo_produto)

            inseridos += 1

    try:

        db.commit()

    except Exception:

        db.rollback()

        raise

    return {

        "inseridos": inseridos,
        "atualizados": atualizados,

    }