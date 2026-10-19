from .repository import ConfigAlertaRepository


class ConfigAlertaService:

    def __init__(self):
        self.repository = ConfigAlertaRepository()

    def listar(self, db, usuario_id):
        return self.repository.listar(db, usuario_id)

    def salvar(self, db, usuario_id, configuracoes):
        self.repository.salvar(db, usuario_id, configuracoes)

        return {
            "mensagem": "Configuracoes salvas com sucesso."
        }

    def listar_tipos(self, db, usuario_id):
        configuracao = self.repository.listar_tipos(
            db,
            usuario_id,
        )

        if configuracao is None:
            return {
                "alteracao_preco": True,
                "estoque_minimo": False,
                "sem_movimentacao": True,
                "percentual_alteracao_preco": 10.0,
                "quantidade_minima_estoque": 20.0,
                "dias_sem_venda": 30,
            }

        return {
            "alteracao_preco": configuracao.alteracao_preco,
            "estoque_minimo": configuracao.estoque_minimo,
            "sem_movimentacao": configuracao.sem_movimentacao,
            "percentual_alteracao_preco": float(
                configuracao.percentual_alteracao_preco
            ),
            "quantidade_minima_estoque": float(
                configuracao.quantidade_minima_estoque
            ),
            "dias_sem_venda": configuracao.dias_sem_venda,
        }

    def salvar_tipos(self, db, usuario_id, configuracao):
        self.repository.salvar_tipos(
            db,
            usuario_id,
            configuracao,
        )

        return {
            "mensagem": "Tipos de alertas salvos com sucesso."
        }
