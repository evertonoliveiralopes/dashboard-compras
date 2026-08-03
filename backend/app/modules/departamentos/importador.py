import pandas as pd
from sqlalchemy.orm import Session

from app.models.departamento import Departamento
from app.utils.normalizar_codigo import normalizar_codigo


def limpar_texto(valor):
    if pd.isna(valor):
        return None

    valor = str(valor).strip()

    if valor == "" or valor.lower() == "nan":
        return None

    return valor


def importar_dataframe(df: pd.DataFrame, db: Session):
    
    departamentos = {
        d.codigo: d
        for d in db.query(Departamento).all()
    }

    inseridos = 0
    atualizados = 0

    for _, linha in df.iterrows():
        
        codigo = normalizar_codigo(
            linha.get("Depto.")
        )

        descricao = limpar_texto(
            linha.get("Descrição")
        )

        if not codigo or not descricao:
            continue

        departamento = departamentos.get(codigo)

        if departamento:

            departamento.descricao = descricao

            atualizados += 1

        else:

            db.add(
                Departamento(
                    codigo=codigo,
                    descricao=descricao,
                )
            )

            inseridos += 1

    db.commit()

    return {
        "inseridos": inseridos,
        "atualizados": atualizados,
    }