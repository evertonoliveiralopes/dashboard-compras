from sqlalchemy.orm import Session
from app.models.produto import Produto
from app.models.entrada import Entrada
from app.models.item_entrada import ItemEntrada


def buscar_entrada(
    db: Session,
    empresa,
    nota_fiscal,
    fornecedor_id
):

    return (
        db.query(Entrada)
        .filter(
            Entrada.empresa == empresa,
            Entrada.nota_fiscal == nota_fiscal,
            Entrada.fornecedor_id == fornecedor_id
        )
        .first()
    )
    
def buscar_item_entrada(
    db: Session,
    entrada_id: int,
    produto_id: int,
):
    return (
        db.query(ItemEntrada)
        .filter(
            ItemEntrada.entrada_id == entrada_id,
            ItemEntrada.produto_id == produto_id,
        )
        .first()
    )
    
from app.models.fornecedor import Fornecedor


def buscar_fornecedor(
    db: Session,
    codigo: str
):

    return (
        db.query(Fornecedor)
        .filter(
            Fornecedor.codigo == codigo
        )
        .first()
    )
    
def buscar_produto(
    db: Session,
    codigo: str
):

    return (
        db.query(Produto)
        .filter(
            Produto.codigo == codigo
        )
        .first()
    )
    
def criar_entrada(
    db: Session,
    entrada: Entrada
):
    db.add(entrada)
    db.flush()   # Gera o ID sem fazer commit
    return entrada

from app.models.item_entrada import ItemEntrada


def criar_item_entrada(
    db: Session,
    item: ItemEntrada,
):
    db.add(item)
    db.flush()
    return item

def listar_entradas(
    db: Session,
):
    return (
        db.query(Entrada)
        .order_by(
            Entrada.data_entrada.desc(),
            Entrada.id.desc()
        )
        .all()
    )
    
from sqlalchemy.orm import joinedload


def buscar_entrada_por_id(
    db: Session,
    entrada_id: int,
):
    return (
        db.query(Entrada)
        .options(
            joinedload(Entrada.fornecedor),
            joinedload(Entrada.itens).joinedload(ItemEntrada.produto)
        )
        .filter(
            Entrada.id == entrada_id
        )
        .first()
    )