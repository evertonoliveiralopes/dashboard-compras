from fastapi import UploadFile
from sqlalchemy.orm import Session
import pandas as pd

from . import repository

from .importador import importar_dataframe
from app.models.historico_importacao import HistoricoImportacao



class ProdutoService:

    def importar(self, arquivo: UploadFile, db: Session, loja_id: int):

        if arquivo.filename.lower().endswith(".csv"):

            try:
                df = pd.read_csv(
                    arquivo.file,
                    sep=";",
                    encoding="utf-8",
                    engine="python",
                    on_bad_lines="skip",
                )

            except UnicodeDecodeError:

                arquivo.file.seek(0)

                df = pd.read_csv(
                    arquivo.file,
                    sep=";",
                    encoding="latin1",
                    engine="python",
                    on_bad_lines="skip",
                )

        else:

            df = pd.read_excel(arquivo.file)

        resultado = importar_dataframe(df, db, loja_id)
        historico = HistoricoImportacao(
            tipo="Produtos",
            loja_id=loja_id,
            arquivo=arquivo.filename,
            registros=len(df),
            inseridos=resultado["inseridos"],
            atualizados=resultado["atualizados"],
            erros=0,
            status="SUCESSO",
        )

        db.add(historico)
        db.commit()

        return resultado
    
    def listar(
        self,
        db: Session,
        busca: str | None = None,
        departamento: str | None = None,
        status: int | None = None,
        offset: int = 0,
        limit: int = 50,
        loja_id: int | None = None,
    ):

        return repository.listar_produtos(
            db=db,
            busca=busca,
            departamento=departamento,
            status=status,
            offset=offset,
            limit=limit,
            loja_id=loja_id,
        )