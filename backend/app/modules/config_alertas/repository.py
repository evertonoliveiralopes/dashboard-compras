from sqlalchemy.orm import Session

from app.models.config_alerta import ConfigAlerta
from app.models.config_tipo_alerta import ConfigTipoAlerta


class ConfigAlertaRepository:

    def listar(self, db: Session, usuario_id: int):

        return (
            db.query(ConfigAlerta)
            .filter(
                ConfigAlerta.usuario_id == usuario_id
            )
            .all()
        )

    def salvar(
        self,
        db: Session,
        usuario_id: int,
        configuracoes,
    ):

        # Remove as configurações anteriores do usuário
        (
            db.query(ConfigAlerta)
            .filter(
                ConfigAlerta.usuario_id == usuario_id
            )
            .delete()
        )

        # Salva as novas configurações
        for item in configuracoes:

            db.add(
                ConfigAlerta(
                    usuario_id=usuario_id,
                    departamento_id=item.departamento_id,
                    ativo=item.ativo,
                )
            )

        db.commit()

    def listar_tipos(self, db: Session, usuario_id: int):

        return (
            db.query(ConfigTipoAlerta)
            .filter(
                ConfigTipoAlerta.usuario_id == usuario_id
            )
            .first()
        )

    def salvar_tipos(
        self,
        db: Session,
        usuario_id: int,
        configuracao,
    ):

        existente = (
            db.query(ConfigTipoAlerta)
            .filter(
                ConfigTipoAlerta.usuario_id == usuario_id
            )
            .first()
        )

        if existente:

            existente.alteracao_preco = configuracao.alteracao_preco
            existente.estoque_minimo = configuracao.estoque_minimo
            existente.sem_movimentacao = configuracao.sem_movimentacao

        else:

            db.add(
                ConfigTipoAlerta(
                    usuario_id=usuario_id,
                    alteracao_preco=configuracao.alteracao_preco,
                    estoque_minimo=configuracao.estoque_minimo,
                    sem_movimentacao=configuracao.sem_movimentacao,
                )
            )

        db.commit()