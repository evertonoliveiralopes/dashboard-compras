import pandas as pd

from datetime import datetime

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.entrada import Entrada
from app.models.item_entrada import ItemEntrada

from app.utils.codigo_fornecedor import normalizar_codigo_fornecedor
from app.utils.codigo_produto import normalizar_codigo_produto
from app.models.historico_importacao import HistoricoImportacao

from app.modules.entradas.repository import (
    buscar_entrada,
    buscar_fornecedor,
    buscar_produto,
    buscar_item_entrada,
    criar_entrada,
    criar_item_entrada,
)


def importar_arquivo(
    arquivo: UploadFile,
    db: Session,
    loja_id: int,
):

    df = pd.read_csv(
        arquivo.file,
        sep=",",
        encoding="latin1",
        header=None,
        engine="python",
        on_bad_lines="skip",
    )

    df.columns = [
        "nota_fiscal",
        "tipo",
        "mes",
        "ano",
        "data_entrada",
        "cfop",
        "coi",
        "codigo_fornecedor",
        "codigo_produto",
        "descricao_produto",
        "emb",
        "quantidade",
        "emb_saida",
        "custo_unitario",
        "coluna_extra",
        "valor_total",
    ]
    registros_importados = len(df)

    return importar_dataframe(
        df,
        db,
        arquivo.filename,
        registros_importados,
        loja_id,
    )


def importar_dataframe(
    df: pd.DataFrame,
    db: Session,
    nome_arquivo: str,
    registros_importados: int,
    loja_id: int,
):

    df = df[df["codigo_fornecedor"] != "PART."]

    df = df[
        pd.to_numeric(
            df["nota_fiscal"],
            errors="coerce",
        ).notna()
    ]

    entradas_criadas = 0

    fornecedores_encontrados = 0
    fornecedores_nao_encontrados = 0

    produtos_encontrados = 0
    produtos_nao_encontrados = 0

    itens_criados = 0

    for _, linha in df.iterrows():

        ##############################
        # FORNECEDOR
        ##############################

        codigo_fornecedor = normalizar_codigo_fornecedor(
            linha["codigo_fornecedor"]
        )

        fornecedor = buscar_fornecedor(
            db,
            codigo_fornecedor,
        )

        if fornecedor is None:
            fornecedores_nao_encontrados += 1
            continue

        fornecedores_encontrados += 1

        ##############################
        # PRODUTO
        ##############################

        codigo_produto = normalizar_codigo_produto(
            linha["codigo_produto"]
        )

        produto = buscar_produto(
            db,
            codigo_produto,
        )

        if produto is None:
            produtos_nao_encontrados += 1
            continue

        produtos_encontrados += 1

        ##############################
        # DATA
        ##############################

        data_entrada = datetime.strptime(
            str(linha["data_entrada"]).strip(),
            "%d/%m/%Y",
        ).date()

        ##############################
        # ENTRADA
        ##############################

        entrada = buscar_entrada(
            db=db,
            loja_id=loja_id,
            nota_fiscal=str(linha["nota_fiscal"]),
            fornecedor_id=fornecedor.id,
        )

        if entrada is None:

            entrada = Entrada(
                empresa=loja_id,
                loja_id=loja_id,
                nota_fiscal=str(linha["nota_fiscal"]),
                data_entrada=data_entrada,
                fornecedor_id=fornecedor.id,
            )

            criar_entrada(
                db=db,
                entrada=entrada,
            )

            entradas_criadas += 1

        ##############################
        # QUANTIDADE
        ##############################

        quantidade = float(
            str(linha["quantidade"])
            .replace(".", "")
            .replace(",", ".")
        )

        ##############################
        # CUSTO
        ##############################

        custo = float(
            str(linha["custo_unitario"])
            .replace(".", "")
            .replace(",", ".")
        )

        ##############################
        # ITEM
        ##############################

        item_existente = buscar_item_entrada(
            db=db,
            entrada_id=entrada.id,
            produto_id=produto.id,
        )

        if item_existente is None:

            item = ItemEntrada(
                entrada_id=entrada.id,
                produto_id=produto.id,
                quantidade=float(quantidade),
                custo=float(custo),
                custo_nota=float(custo),
                descricao_produto=str(linha["descricao_produto"]),
            )

            criar_item_entrada(
                db=db,
                item=item,
            )

            itens_criados += 1
    db.commit()
    
    historico = HistoricoImportacao(
        tipo="Entradas",
        loja_id=loja_id,
        arquivo=nome_arquivo,
        registros=registros_importados,
        inseridos=entradas_criadas,
        atualizados=itens_criados,
        erros=(
            fornecedores_nao_encontrados
            + produtos_nao_encontrados
        ),
        status="SUCESSO",
    )

    db.add(historico)
    db.commit()

    return {
        "mensagem": "Importação concluída",
        "entradas_criadas": entradas_criadas,
        "itens_criados": itens_criados,
        "fornecedores_encontrados": fornecedores_encontrados,
        "fornecedores_nao_encontrados": fornecedores_nao_encontrados,
        "produtos_encontrados": produtos_encontrados,
        "produtos_nao_encontrados": produtos_nao_encontrados,
    }