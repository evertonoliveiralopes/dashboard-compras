from sqlalchemy.orm import Session

from app.models.config_alerta import ConfigAlerta



class ConfigAlertaRepository:

    def listar(self, db: Session, usuario_id: int):

        return (
            db.query(ConfigAlerta)
            .filter(
                ConfigAlerta.usuario_id == usuario_id
            )
            .all()
        )
    def salvar(self, db, usuario_id, configuracoes):

        (
            db.query(ConfigAlerta)
            .filter(
                ConfigAlerta.usuario_id == usuario_id
            )
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