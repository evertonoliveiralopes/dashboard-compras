from pandas import DataFrame
from sqlalchemy.orm import Session

from .importador import importar_dataframe
from app.models.historico_importacao import HistoricoImportacao


class DepartamentoService:

    def importar(
        self,
        df: DataFrame,
        db: Session,
        nome_arquivo: str = "departamentos",
    ):

        resultado = importar_dataframe(
            df,
            db,
        )

        historico = HistoricoImportacao(
            tipo="Departamentos",
            arquivo=nome_arquivo,
            registros=len(df),
            inseridos=resultado["inseridos"],
            atualizados=resultado["atualizados"],
            erros=0,
            status="SUCESSO",
        )

        db.add(historico)
        db.commit()

        return resultado