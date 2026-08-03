from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
import pandas as pd

from app.database import get_db
from .importador import importar_dataframe

router = APIRouter(
    prefix="/produtos",
    tags=["Produtos"],
)


@router.post("/importar")
async def importar_produtos(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
):

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

    return importar_dataframe(df, db)