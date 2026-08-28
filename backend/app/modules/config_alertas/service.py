from .repository import ConfigAlertaRepository


class ConfigAlertaService:

    def __init__(self):
        self.repository = ConfigAlertaRepository()

    def listar(self, db, usuario_id):

        return self.repository.listar(
            db,
            usuario_id,
        )

    def salvar(
        self,
        db,
        usuario_id,
        configuracoes,
    ):

        self.repository.salvar(
            db,
            usuario_id,
            configuracoes,
        )

        return {
            "mensagem": "Configurações salvas com sucesso."
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
            }

        return {
            "alteracao_preco": configuracao.alteracao_preco,
            "estoque_minimo": configuracao.estoque_minimo,
            "sem_movimentacao": configuracao.sem_movimentacao,
        }

    def salvar_tipos(
        self,
        db,
        usuario_id,
        configuracao,
    ):

        self.repository.salvar_tipos(
            db,
            usuario_id,
            configuracao,
        )

        return {
            "mensagem": "Tipos de alertas salvos com sucesso."
        }