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