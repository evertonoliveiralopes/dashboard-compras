from app.modules.entradas.repository import listar_entradas
from app.modules.entradas.repository import buscar_entrada_por_id


def listar_entradas_service(db, loja_id=None):

    entradas = listar_entradas(
        db,
        loja_id,
    )

    resultado = []

    for entrada in entradas:

        resultado.append(
            {
                "id": entrada.id,
                "empresa": entrada.empresa,
                "nota_fiscal": entrada.nota_fiscal,
                "data_entrada": entrada.data_entrada,
                "fornecedor": (
                    entrada.fornecedor.nome_fantasia
                    if entrada.fornecedor
                    else None
                ),
                "itens": len(entrada.itens),
            }
        )

    return resultado


def detalhar_entrada_service(
    db,
    entrada_id: int,
    loja_id=None,
):

    entrada = buscar_entrada_por_id(
        db,
        entrada_id,
        loja_id,
    )

    if entrada is None:
        return None

    itens = []

    valor_total = 0

    print("Quantidade de itens:", len(entrada.itens))

    for item in entrada.itens:

        subtotal = item.quantidade * item.custo

        valor_total += subtotal

        itens.append(
            {
                "produto_id": item.produto.id if item.produto else None,
                "codigo": item.produto.codigo if item.produto else None,
                "descricao": item.descricao_produto,
                "quantidade": item.quantidade,
                "custo": item.custo,
                "subtotal": subtotal,
            }
        )

    return {
        "id": entrada.id,
        "empresa": entrada.empresa,
        "nota_fiscal": entrada.nota_fiscal,
        "data_entrada": entrada.data_entrada,
        "fornecedor": (
            entrada.fornecedor.nome_fantasia
            if entrada.fornecedor
            else None
        ),
        "total_itens": len(entrada.itens),
        "valor_total": valor_total,
        "itens": itens,
    }