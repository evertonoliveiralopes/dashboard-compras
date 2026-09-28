from datetime import date, timedelta
from sqlalchemy.orm import Session

from .repository import DashboardRepository


class DashboardService:

    def __init__(self):
        self.repository = DashboardRepository()

    def _subtrair_meses(self, data, meses):
        ano = data.year
        mes = data.month - meses

        while mes <= 0:
            mes += 12
            ano -= 1

        return date(ano, mes, data.day)

    def calcular_periodos(
        self,
        periodo="mes",
        data_inicio=None,
        data_fim=None,
    ):
        hoje = date.today()

        if periodo == "personalizado":
            if not data_inicio or not data_fim:
                raise ValueError(
                    "Para período personalizado, "
                    "data_inicio e data_fim são obrigatórios."
                )

            inicio = data_inicio
            fim = data_fim + timedelta(days=1)

            duracao = fim - inicio

            fim_anterior = inicio
            inicio_anterior = inicio - duracao

        else:
            meses = {
                "mes": 1,
                "3_meses": 3,
                "6_meses": 6,
                "12_meses": 12,
            }.get(periodo)

            if meses is None:
                raise ValueError(
                    f"Período inválido: {periodo}"
                )

            inicio_mes_atual = hoje.replace(day=1)

            inicio = self._subtrair_meses(
                inicio_mes_atual,
                meses - 1,
            )

            fim = hoje + timedelta(days=1)

            inicio_anterior = self._subtrair_meses(
                inicio,
                meses,
            )

            fim_anterior = self._subtrair_meses(
                fim - timedelta(days=1),
                meses,
            ) + timedelta(days=1)

        return {
            "data_inicio": inicio,
            "data_fim": fim,
            "data_inicio_anterior": inicio_anterior,
            "data_fim_anterior": fim_anterior,
        }

    def indicadores(
        self,
        db: Session,
        loja_id=None,
        periodo="mes",
        data_inicio=None,
        data_fim=None,
    ):
        periodos = self.calcular_periodos(
            periodo=periodo,
            data_inicio=data_inicio,
            data_fim=data_fim,
        )

        indicadores = self.repository.indicadores_periodo(
            db=db,
            loja_id=loja_id,
            data_inicio=periodos["data_inicio"],
            data_fim=periodos["data_fim"],
            data_inicio_anterior=periodos[
                "data_inicio_anterior"
            ],
            data_fim_anterior=periodos[
                "data_fim_anterior"
            ],
        )

        compras_atual = indicadores["compras_atual"]
        compras_anterior = indicadores["compras_anterior"]

        vendas_atual = indicadores["vendas_atual"]
        vendas_anterior = indicadores["vendas_anterior"]

        if compras_anterior:
            variacao_compras = (
                (compras_atual - compras_anterior)
                / compras_anterior
            ) * 100
        else:
            variacao_compras = 0

        if vendas_anterior:
            variacao_vendas = (
                (vendas_atual - vendas_anterior)
                / vendas_anterior
            ) * 100
        else:
            variacao_vendas = 0

        return {
            "valor_comprado": compras_atual,
            "variacao_compras": variacao_compras,
            "quantidade_vendida": vendas_atual,
            "variacao_vendas": variacao_vendas,
            "valor_estoque": indicadores["valor_estoque"],
            "periodo": {
                "data_inicio": periodos["data_inicio"],
                "data_fim": periodos["data_fim"],
                "data_inicio_anterior": periodos[
                    "data_inicio_anterior"
                ],
                "data_fim_anterior": periodos[
                    "data_fim_anterior"
                ],
            },
        }

    def compras_por_mes(self, db: Session, loja_id=None):
        return self.repository.compras_por_mes(db, loja_id)

    def top_fornecedores(self, db: Session, loja_id=None):
        return self.repository.top_fornecedores(db, loja_id)

    def compras_por_departamento(self, db: Session, loja_id=None):
        return self.repository.compras_por_departamento(db, loja_id)

    def alertas(self, db: Session, loja_id=None):
        return self.repository.alertas(db, loja_id)

    def ultimas_importacoes(self, db: Session, loja_id=None):
        return self.repository.ultimas_importacoes(db, loja_id)