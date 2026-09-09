import pandas as pd
from sqlalchemy.orm import Session

from sqlalchemy.dialects.postgresql import insert

from app.utils.codigo_produto import normalizar_codigo_produto
from app.utils.normalizar_codigo import normalizar_codigo

from app.models.produto import Produto
from app.models.produto_loja import ProdutoLoja


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


def importar_dataframe(
    df: pd.DataFrame,
    db: Session,
    loja_id: int,
):
    inseridos = 0
    atualizados = 0

    df = df.copy()

    # Normaliza os códigos
    df["_codigo_normalizado"] = df["Código"].apply(
        normalizar_codigo_produto
    )

    # Remove registros sem código
    df = df[
        df["_codigo_normalizado"].notna()
        & (df["_codigo_normalizado"] != "")
    ]

    # Remove duplicidades mantendo a última ocorrência
    df = df.drop_duplicates(
        subset=["_codigo_normalizado"],
        keep="last",
    )

    tamanho_lote = 1000

    for inicio_lote in range(0, len(df), tamanho_lote):

        lote = df.iloc[
            inicio_lote:inicio_lote + tamanho_lote
        ]

        codigos_lote = lote["_codigo_normalizado"].tolist()

        # Identifica produtos que já existem
        existentes = set(
            codigo
            for (codigo,) in (
                db.query(Produto.codigo)
                .filter(Produto.codigo.in_(codigos_lote))
                .all()
            )
        )

        registros_produtos = []

        for _, linha in lote.iterrows():

            codigo = linha["_codigo_normalizado"]

            registros_produtos.append(
                {
                    "codigo": codigo,
                    "descricao": limpar_texto(
                        linha.get("Descrição")
                    ),
                    "departamento": normalizar_codigo(
                        linha.get("Depto.")
                    ),
                    "status": limpar_status(
                        linha.get("Status")
                    ),
                }
            )

            if codigo in existentes:
                atualizados += 1
            else:
                inseridos += 1

        # Atualiza somente os dados globais do produto
        comando_produto = insert(Produto).values(
            registros_produtos
        )

        comando_produto = comando_produto.on_conflict_do_update(
            index_elements=["codigo"],
            set_={
                "descricao": comando_produto.excluded.descricao,
                "departamento": comando_produto.excluded.departamento,
                "status": comando_produto.excluded.status,
            },
        )

        db.execute(comando_produto)
        db.flush()

        # Recupera os IDs dos produtos
        produtos = (
            db.query(
                Produto.id,
                Produto.codigo,
            )
            .filter(
                Produto.codigo.in_(codigos_lote)
            )
            .all()
        )

        produto_ids = {
            codigo: produto_id
            for produto_id, codigo in produtos
        }

        # Monta os dados específicos da loja
        registros_produtos_lojas = []

        for _, linha in lote.iterrows():

            codigo = linha["_codigo_normalizado"]
            produto_id = produto_ids.get(codigo)

            if not produto_id:
                continue

            registros_produtos_lojas.append(
                {
                    "produto_id": produto_id,
                    "loja_id": loja_id,
                    "custo": limpar_decimal(
                        linha.get("Custo")
                    ),
                    "preco_venda": limpar_decimal(
                        linha.get("Preço Venda")
                    ),
                    "estoque_atual": limpar_decimal(
                        linha.get("Estoque Atual")
                    ),
                    "estoque_trocas": limpar_decimal(
                        linha.get("Estoque Atual Troca")
                    ),
                }
            )

        # UPSERT dos dados específicos da loja
        if registros_produtos_lojas:

            comando_loja = insert(
                ProdutoLoja
            ).values(
                registros_produtos_lojas
            )

            comando_loja = comando_loja.on_conflict_do_update(
                constraint="uq_produtos_lojas_produto_loja",
                set_={
                    "custo": comando_loja.excluded.custo,
                    "preco_venda": comando_loja.excluded.preco_venda,
                    "estoque_atual": comando_loja.excluded.estoque_atual,
                    "estoque_trocas": comando_loja.excluded.estoque_trocas,
                },
            )

            db.execute(comando_loja)

        db.commit()

    return {
        "inseridos": inseridos,
        "atualizados": atualizados,
    }
