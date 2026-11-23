import unittest
from datetime import date, timedelta
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.database import Base
from app.models import (
    ConfigAlerta, Departamento, Entrada, Fornecedor, ItemEntrada, Loja,
    Produto, ProdutoLoja, Usuario, Venda,
)
from app.modules.radar.router import consultar_radar
from app.modules.config_alertas.schemas import ConfigTipoAlertaSchema
from app.modules.config_alertas.service import ConfigAlertaService


class RadarDepartamentosTest(unittest.TestCase):
    def setUp(self):
        engine = create_engine("sqlite://")
        self.addCleanup(engine.dispose)
        Base.metadata.create_all(engine)
        self.db = Session(engine)
        self.addCleanup(self.db.close)

        self.db.add(Loja(id=1, codigo="1", nome="Loja", unidade="Principal"))
        self.db.add(Fornecedor(id=1, codigo="1", razao_social="Fornecedor"))
        for usuario_id in range(1, 6):
            self.db.add(Usuario(id=usuario_id, nome="Comprador", email=f"{usuario_id}@teste.com", senha_hash="teste"))

        referencia = date(2026, 11, 19)
        self.db.add_all([
            Entrada(id=1, loja_id=1, fornecedor_id=1, data_entrada=referencia - timedelta(days=1)),
            Entrada(id=2, loja_id=1, fornecedor_id=1, data_entrada=referencia),
        ])
        for departamento_id in (1, 2):
            codigo = str(departamento_id)
            self.db.add(Departamento(id=departamento_id, codigo=codigo, descricao=f"Departamento {codigo}"))
            self.db.add_all([
                ConfigAlerta(usuario_id=1, departamento_id=departamento_id, ativo=departamento_id == 1),
                ConfigAlerta(usuario_id=2, departamento_id=departamento_id, ativo=departamento_id == 2),
                ConfigAlerta(usuario_id=3, departamento_id=departamento_id, ativo=False),
                ConfigAlerta(usuario_id=5, departamento_id=departamento_id, ativo=True),
            ])
            for tipo, saldo, dias, quantidade in ((1, 0, 0, 30), (2, 4, 0, 30), (3, 4, 91, 1)):
                produto_id = departamento_id * 10 + tipo
                self.db.add(Produto(id=produto_id, codigo=str(produto_id), descricao=f"Produto {produto_id}", departamento=codigo))
                self.db.add(ProdutoLoja(loja_id=1, produto_id=produto_id, estoque_atual=saldo, custo=2))
                self.db.add(Venda(loja_id=1, empresa="1", codigo_produto=str(produto_id),
                                  data=referencia - timedelta(days=dias), quantidade=quantidade))
            self.db.add_all([
                ItemEntrada(entrada_id=1, produto_id=departamento_id * 10 + 1, custo=10),
                ItemEntrada(entrada_id=2, produto_id=departamento_id * 10 + 1, custo=12),
            ])
        self.db.commit()

    def consultar(self, usuario_id, departamento=None):
        usuario = self.db.get(Usuario, usuario_id)
        return consultar_radar(loja_id=1, departamento=departamento, usuario=usuario, db=self.db)

    def test_aplica_departamentos_do_usuario_em_todas_as_categorias(self):
        for usuario_id in (1, 2):
            with self.subTest(usuario_id=usuario_id):
                resultado = self.consultar(usuario_id)
                filtro = resultado["filtro"]
                self.assertTrue(filtro["monitoramento_configurado"])
                self.assertEqual([item["codigo"] for item in filtro["departamentos"]], [str(usuario_id)])
                for categoria, produto in (("ruptura", 1), ("reposicao", 2), ("parado", 3), ("aumentos", 1)):
                    self.assertEqual([item["codigo"] for item in resultado[categoria]], [f"{usuario_id}{produto}"])
                self.assertEqual(resultado["valor_parado"], 8)

    def test_filtro_manual_restringe_a_selecao_do_usuario(self):
        todos_monitorados = self.consultar(5)
        self.assertEqual({item["codigo"] for item in todos_monitorados["ruptura"]}, {"11", "21"})
        escolhido = self.consultar(5, "2")
        self.assertEqual(escolhido["filtro"]["departamento_aplicado"], "2")
        self.assertEqual([item["codigo"] for item in escolhido["ruptura"]], ["21"])

        resultado = self.consultar(1, "2")
        self.assertIsNone(resultado["filtro"]["departamento_aplicado"])
        self.assertEqual([item["codigo"] for item in resultado["ruptura"]], ["11"])

    def test_restringe_aumentos_ao_percentual_configurado_por_usuario(self):
        item = self.db.query(ItemEntrada).filter_by(entrada_id=2, produto_id=21).one()
        item.custo = 13
        ConfigAlertaService().salvar_tipos(self.db, 5, ConfigTipoAlertaSchema(
            alteracao_preco=True,
            estoque_minimo=False,
            sem_movimentacao=True,
            percentual_alteracao_preco=30,
        ))

        aumentos = self.consultar(5)["aumentos"]
        self.assertEqual([item["codigo"] for item in aumentos], ["21"])
        self.assertEqual(aumentos[0]["variacao"], 30)
        self.assertEqual(aumentos[0]["custo_anterior"], 10)
        self.assertEqual(aumentos[0]["custo_atual"], 13)
        self.assertEqual([item["codigo"] for item in self.consultar(1)["aumentos"]], ["11"])

    def test_sem_configuracao_e_todos_desmarcados_tem_resultados_distintos(self):
        with patch("app.modules.radar.router.montar_radar") as montar_radar:
            resultado = self.consultar(3)
            montar_radar.assert_not_called()
        self.assertTrue(resultado["filtro"]["monitoramento_configurado"])
        self.assertEqual(resultado["filtro"]["departamentos"], [])
        self.assertNotIn("ruptura", resultado)

        sem_preferencia = self.consultar(4)
        self.assertFalse(sem_preferencia["filtro"]["monitoramento_configurado"])
        self.assertEqual({item["codigo"] for item in sem_preferencia["ruptura"]}, {"11", "21"})
