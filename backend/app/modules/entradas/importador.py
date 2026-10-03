import csv
import io

import pandas as pd

from datetime import datetime

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.entrada import Entrada
from app.models.item_entrada import ItemEntrada
from app.models.fornecedor import Fornecedor
from app.models.produto import Produto
from app.models.historico_importacao import HistoricoImportacao

from app.utils.codigo_fornecedor import normalizar_codigo_fornecedor
from app.utils.codigo_produto import normalizar_codigo_produto

from app.modules.entradas.repository import (
    criar_entrada,
    criar_item_entrada,
)


# Equivalências conhecidas de códigos históricos de fornecedores.
#
# EDY ALIMENTOS:
# código utilizado no histórico: 20895
# código atual no cadastro:       208959620
ALIASES_FORNECEDORES = {
    "20895": "208959620",
}


def importar_arquivo(
    arquivo: UploadFile,
    db: Session,
    loja_id: int,
):
    conteudo = arquivo.file.read().decode("latin1")

    linhas_normalizadas = []

    leitor = csv.reader(io.StringIO(conteudo))

    for linha in leitor:
        if len(linha) == 16:
            linhas_normalizadas.append(linha)

        elif len(linha) == 18:
            linha = [
                linha[0],   # nota_fiscal
                linha[1],   # tipo
                linha[2],   # mes
                linha[3],   # ano
                linha[4],   # data_entrada
                linha[5],   # cfop
                linha[6],   # coi
                linha[7],   # codigo_fornecedor
                linha[8],   # codigo_produto
                linha[9],   # descricao_produto
                linha[10],  # emb
                linha[11],  # quantidade
                linha[13],  # emb_saida
                linha[14],  # custo_unitario
                linha[16],  # coluna_extra
                linha[17],  # valor_total
            ]

            linhas_normalizadas.append(linha)

    df = pd.DataFrame(linhas_normalizadas)

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

    ##############################
    # FILTROS
    ##############################

    df = df[df["codigo_fornecedor"] != "PART."]

    df = df[
        pd.to_numeric(
            df["nota_fiscal"],
            errors="coerce",
        ).notna()
    ]

    ##############################
    # CONTADORES
    ##############################

    entradas_criadas = 0

    fornecedores_encontrados = 0
    fornecedores_nao_encontrados = 0

    produtos_encontrados = 0
    produtos_nao_encontrados = 0

    itens_criados = 0

    ##############################
    # CACHE DE FORNECEDORES
    ##############################

    codigos_fornecedores = {
        normalizar_codigo_fornecedor(codigo)
        for codigo in df["codigo_fornecedor"]
    }

    codigos_fornecedores.discard(None)

    codigos_fornecedores = {
        ALIASES_FORNECEDORES.get(codigo, codigo)
        for codigo in codigos_fornecedores
    }

    fornecedores_cache = {
        fornecedor.codigo: fornecedor
        for fornecedor in (
            db.query(Fornecedor)
            .filter(
                Fornecedor.codigo.in_(
                    codigos_fornecedores
                )
            )
            .all()
        )
    }

    ##############################
    # CACHE DE PRODUTOS
    ##############################

    codigos_produtos = {
        normalizar_codigo_produto(codigo)
        for codigo in df["codigo_produto"]
    }

    codigos_produtos.discard(None)

    produtos_cache = {
        produto.codigo: produto
        for produto in (
            db.query(Produto)
            .filter(
                Produto.codigo.in_(
                    codigos_produtos
                )
            )
            .all()
        )
    }

    ##############################
    # CACHE DE ENTRADAS
    ##############################

    entradas_existentes = (
        db.query(Entrada)
        .filter(
            Entrada.loja_id == loja_id
        )
        .all()
    )

    entradas_cache = {
        (
            str(entrada.nota_fiscal),
            entrada.fornecedor_id,
            entrada.data_entrada,
        ): entrada
        for entrada in entradas_existentes
    }

    ##############################
    # CACHE DE ITENS
    ##############################

    itens_existentes = (
        db.query(
            ItemEntrada.entrada_id,
            ItemEntrada.produto_id,
        )
        .join(
            Entrada,
            ItemEntrada.entrada_id == Entrada.id,
        )
        .filter(
            Entrada.loja_id == loja_id
        )
        .all()
    )

    itens_cache = {
        (
            entrada_id,
            produto_id,
        )
        for entrada_id, produto_id in itens_existentes
    }

    ##############################
    # IMPORTAÇÃO
    ##############################

    for _, linha in df.iterrows():

        ##############################
        # FORNECEDOR
        ##############################

        codigo_fornecedor = normalizar_codigo_fornecedor(
            linha["codigo_fornecedor"]
        )

        codigo_fornecedor = ALIASES_FORNECEDORES.get(
            codigo_fornecedor,
            codigo_fornecedor,
        )

        fornecedor = fornecedores_cache.get(
            codigo_fornecedor
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

        produto = produtos_cache.get(
            codigo_produto
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

        nota_fiscal = str(
            linha["nota_fiscal"]
        ).strip()

        chave_entrada = (
            nota_fiscal,
            fornecedor.id,
            data_entrada,
        )

        entrada = entradas_cache.get(
            chave_entrada
        )

        if entrada is None:

            entrada = Entrada(
                empresa=loja_id,
                loja_id=loja_id,
                nota_fiscal=nota_fiscal,
                data_entrada=data_entrada,
                fornecedor_id=fornecedor.id,
            )

            criar_entrada(
                db=db,
                entrada=entrada,
            )

            entradas_cache[chave_entrada] = entrada

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

        chave_item = (
            entrada.id,
            produto.id,
        )

        if chave_item not in itens_cache:

            item = ItemEntrada(
                entrada_id=entrada.id,
                produto_id=produto.id,
                quantidade=float(quantidade),
                custo=float(custo),
                custo_nota=float(custo),
                descricao_produto=str(
                    linha["descricao_produto"]
                ),
            )

            criar_item_entrada(
                db=db,
                item=item,
            )

            itens_cache.add(chave_item)

            itens_criados += 1

    ##############################
    # COMMIT DA IMPORTAÇÃO
    ##############################

    db.commit()

    ##############################
    # HISTÓRICO
    ##############################

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