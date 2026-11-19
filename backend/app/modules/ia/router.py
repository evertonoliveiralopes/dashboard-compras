import json
import os
import re
import unicodedata
from urllib.error import URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, PositiveInt
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.departamento import Departamento
from app.models.loja import Loja
from app.modules.auth.security import get_current_user

from .analises import TITULOS, analisar

router = APIRouter(
    prefix="/ia",
    tags=["IA"],
    dependencies=[Depends(get_current_user)],
)

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-3.1-flash-lite:generateContent"
)
VOCABULARIO = set("""
    aumento aumentaram alteracao avaliar comprar compra compras custo custos
    demanda esgotado esgotados esta estao estoque estoques falta faltando
    fornecedor fornecedores hoje imobilizado imobilizados item itens loja
    lojas mercadoria mercadorias movimentacao parado parados perdido
    preco precos preciso prioridade produto produtos reajuste reajustes
    recomendacao repor reposicao risco ruptura rupturas saldo sem
    saida saidas subiu subiram total valor venda venderam vendas giro baixo
""".split())
PADROES = {
    "comprar": r"\b(comprar|repor|reposicao|reabastecer)\b",
    "fornecedor": r"\b(aumento|aumentou|aumentaram|reajuste|reajustes|subiu|subiram|encareceu|encareceram)\b",
    "ruptura": r"\b(rupturas?|esgotad[oa]s?|faltando)\b|\bsem estoque\b",
    "parado": r"\b(parad[oa]s?|imobilizad[oa]s?)\b|\bsem (vendas?|saida|giro)\b",
}


class Pergunta(BaseModel):
    pergunta: str = Field(min_length=1, max_length=400)
    loja_id: PositiveInt | None = None
    departamento_ids: list[PositiveInt] = Field(default_factory=list, max_length=100)


def identificar_pergunta(pergunta):
    normalizada = unicodedata.normalize("NFKD", pergunta.casefold())
    normalizada = "".join(letra for letra in normalizada if not unicodedata.combining(letra))
    tipos = [tipo for tipo, padrao in PADROES.items() if re.search(padrao, normalizada)]
    if len(tipos) == 1:
        return tipos[0]
    if len(tipos) > 1:
        return None

    # Envia somente termos de negócio conhecidos. Nomes, números e texto livre ficam locais.
    palavras = [termo for termo in re.findall(r"[a-z]+", normalizada) if termo in VOCABULARIO]
    chave = os.getenv("GEMINI_API_KEY", "").strip()
    if not chave or not palavras:
        return None

    instrucao = (
        "Classifique o assunto em português usando uma palavra: comprar (reposição), "
        "fornecedor (aumento de custo), ruptura (falta por loja), parado (estoque parado), "
        "ou desconhecido se não estiver claro. Termos: " + " ".join(palavras)
    )
    requisicao = Request(
        GEMINI_URL,
        data=json.dumps({
            "contents": [{"parts": [{"text": instrucao}]}],
            "generationConfig": {"maxOutputTokens": 128},
        }).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": chave},
        method="POST",
    )
    try:
        with urlopen(requisicao, timeout=10) as resposta:
            partes = json.load(resposta)["candidates"][0]["content"]["parts"]
        texto = "".join(
            parte.get("text", "") for parte in partes if not parte.get("thought")
        ).strip().casefold().rstrip(".")
        return texto if texto in TITULOS else None
    except (URLError, TimeoutError, ValueError, KeyError, IndexError, TypeError):
        return None


@router.post("/perguntar")
def perguntar(dados: Pergunta, db: Session = Depends(get_db)):
    tipo = identificar_pergunta(dados.pergunta)
    if tipo is None:
        return {
            "mensagem": "Faça uma pergunta por vez sobre reposição, aumento de custo, "
            "ruptura ou valor do estoque parado há mais de 90 dias.",
        }

    consulta = db.query(Loja).filter(Loja.ativo.is_(True))
    if dados.loja_id is not None:
        consulta = consulta.filter(Loja.id == dados.loja_id)
    lojas = consulta.order_by(Loja.id).all()
    if not lojas:
        raise HTTPException(status_code=404, detail="Nenhuma loja ativa encontrada nesse filtro.")

    ids = set(dados.departamento_ids)
    departamentos = []
    if ids:
        departamentos = [
            codigo
            for (codigo,) in db.query(Departamento.codigo).filter(Departamento.id.in_(ids)).all()
        ]
        if len(departamentos) != len(ids):
            raise HTTPException(status_code=422, detail="Há departamentos inválidos no filtro.")

    return analisar(db, tipo, lojas, departamentos)

