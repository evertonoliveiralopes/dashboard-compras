import io
import pandas as pd


def ler_csv(arquivo):

    conteudo = arquivo.file.read()

    return pd.read_csv(
        io.BytesIO(conteudo),
        sep=";",
        encoding="utf-8",
        engine="python",
        on_bad_lines="skip",
    )