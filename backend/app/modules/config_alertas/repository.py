from sqlalchemy.orm import Session

from app.models.config_alerta import ConfigAlerta
from app.models.config_tipo_alerta import ConfigTipoAlerta


class ConfigAlertaRepository:

    def listar(self, db: Session, usuario_id: int):
        return (
            db.query(ConfigAlerta)
            .filter(ConfigAlerta.usuario_id == usuario_id)
            .all()
        )

    def salvar(self, db: Session, usuario_id: int, configuracoes):
        (
            db.query(ConfigAlerta)
            .filter(ConfigAlerta.usuario_id == usuario_id)
            .delete()
        )

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
            .filter(ConfigTipoAlerta.usuario_id == usuario_id)
            .first()
        )

    def salvar_tipos(
        self,
        db: Session,
        usuario_id: int,
        configuracao,
    ):
        existente = self.listar_tipos(db, usuario_id)

        if existente:
            existente.alteracao_preco = configuracao.alteracao_preco
            existente.estoque_minimo = configuracao.estoque_minimo
            existente.sem_movimentacao = configuracao.sem_movimentacao

            existente.percentual_alteracao_preco = (
                configuracao.percentual_alteracao_preco
            )
            existente.quantidade_minima_estoque = (
                configuracao.quantidade_minima_estoque
            )
            existente.dias_sem_venda = configuracao.dias_sem_venda

        else:
            db.add(
                ConfigTipoAlerta(
                    usuario_id=usuario_id,
                    alteracao_preco=configuracao.alteracao_preco,
                    estoque_minimo=configuracao.estoque_minimo,
                    sem_movimentacao=configuracao.sem_movimentacao,
                    percentual_alteracao_preco=(
                        configuracao.percentual_alteracao_preco
                    ),
                    quantidade_minima_estoque=(
                        configuracao.quantidade_minima_estoque
                    ),
                    dias_sem_venda=configuracao.dias_sem_venda,
                )
            )

        db.commit()
