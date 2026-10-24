# Compra360

**Sistema web para gestão e análise de compras no varejo supermercadista.**

O Compra360 centraliza informações de compras, vendas, estoque e fornecedores para apoiar decisões de abastecimento e acompanhamento da operação.

O projeto nasceu de necessidades identificadas na minha atuação como Comprador Sênior. Nele, aplico minha experiência de negócio ao levantamento de requisitos, desenvolvimento do backend e frontend, estruturação do banco de dados e validação das funcionalidades.

> **Status:** projeto em evolução, atualmente executado e desenvolvido em ambiente local.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Backend | Python, FastAPI, SQLAlchemy e Alembic |
| Frontend | React, Vite, Material UI e Recharts |
| Banco de dados | PostgreSQL |
| Autenticação | JWT |
| Versionamento e empacotamento | Git, GitHub e Docker |
| Experiência anterior em nuvem | Google Cloud Run, Cloud SQL e Secret Manager |

## Funcionalidades

- Dashboard com indicadores e análises de compras.
- Consulta de produtos e fornecedores.
- Consulta de entradas de mercadorias.
- Importação de produtos, departamentos, fornecedores, entradas e vendas.
- Histórico de importações.
- Seleção de loja.
- Configuração de alertas por usuário.
- Autenticação de usuários.

## Dashboard gerencial

O dashboard apresenta evolução mensal das compras, Top 5 fornecedores por valor comprado e compras por departamento.

As análises de compras utilizam o período selecionado. As opções incluem mês, 3 meses, 6 meses e 12 meses. A conclusão da seleção personalizada por data inicial e final permanece entre as próximas etapas.

### Regras dos indicadores

- Valores de compras calculados por `quantidade × custo_unitario`.
- Agrupamento mensal considera mês e ano.
- Comparação com o período anterior equivalente, quando aplicável.
- Cabeçalho responsivo com navegação, identificação da página, seleção de loja e acesso do usuário.

### Variação da quantidade vendida

O indicador compara os últimos 30 dias corridos, incluindo a data atual, com os 30 dias imediatamente anteriores.

`Variação (%) = ((quantidade atual - quantidade anterior) / quantidade anterior) × 100`

Esse indicador independe do filtro de período do dashboard. O indicador de quantidade vendida continua respeitando o filtro selecionado.

O cálculo exige registros de vendas em todas as datas dos dois intervalos. Se faltar algum dia ou a quantidade anterior for zero, a API retorna `null` e a interface apresenta um traço.

A presença de registros em todas as datas não garante, isoladamente, a integridade das importações.

## Importação e tratamento de dados

A Central de Importações reúne os diferentes tipos de arquivo em uma única interface e apresenta o histórico dos processamentos concluídos.

### Entradas de mercadorias

- Suporte aos layouts de 16 e 18 colunas dos relatórios Arius.
- Normalização dos códigos de produtos e fornecedores.
- Identificação da entrada por nota fiscal, fornecedor e data.
- Consolidação de produtos repetidos dentro da mesma entrada.
- Soma das quantidades e cálculo do custo médio ponderado.
- Reimportação idempotente, evitando duplicação de entradas e itens.
- Cache em memória para reduzir consultas repetitivas.
- Compatibilidade com equivalências conhecidas de códigos históricos de fornecedores.

Notas fiscais iguais do mesmo fornecedor em datas diferentes são tratadas como entradas distintas.

Os valores calculados podem apresentar pequenas diferenças em relação ao campo de valor total do relatório de origem.

### Fornecedores

O importador suporta variações na quantidade de campos dos relatórios Arius, preservando os dados necessários à identificação dos fornecedores.

Há tratamento de códigos históricos, incluindo a equivalência `20895 → 208959620`.

Transferências recebidas da Empresa 1 utilizam o fornecedor técnico `E1 - EMPRESA 1 - TRANSFERENCIA ENTRE LOJAS`, representando entradas com custo para a loja recebedora.

### Vendas

- Leitura de CSV com separador `;` e codificação Latin-1.
- Validação integral do relatório antes da substituição de dados.
- Consolidação por loja, data e código do produto.
- Utilização de `Decimal` para preservar a precisão dos valores.
- Preservação de vendas negativas e devoluções.
- Substituição somente das datas presentes no arquivo, para a loja selecionada.
- Identificação determinística dos registros consolidados.
- Gravação das vendas e do histórico em uma única transação.
- Rollback em caso de falha.

**Condição de reimportação:** os relatórios devem conter todas as vendas dos dias selecionados. Os registros anteriores dessas datas e dessa loja são substituídos pelos dados consolidados.

No ambiente local, o frontend envia o CSV completo em uma única requisição.

## Alertas e preferências por usuário

As configurações são vinculadas ao usuário autenticado e persistidas no PostgreSQL.

| Parâmetro | Padrão | Validação |
| --- | ---: | --- |
| Variação mínima de preço | 10% | Entre 0 e 100 |
| Quantidade mínima de estoque | 20 | Maior ou igual a zero |
| Dias sem venda | 30 | Inteiro maior ou igual a 1 |

Os departamentos monitorados são armazenados separadamente dos tipos de alertas. Os parâmetros são carregados pela API e recuperados após atualizar a página.

A migração Alembic `191127f58bc6` adiciona os parâmetros numéricos à tabela `config_tipos_alertas`.

### Alertas documentados no dashboard

| Alerta | Situação identificada |
| --- | --- |
| `SEM_ESTOQUE` | Estoque abaixo do limite configurado |
| `SEM_CUSTO` | Custo igual ou inferior a zero |
| `SEM_COMPRA` | Ausência de entrada de compra identificada |
| `SEM_VENDA` | Ausência de vendas no período configurado |

### Regras do alerta SEM_VENDA

- Utiliza a quantidade de dias definida pelo usuário.
- Considera dias completos, excluindo a data atual.
- Respeita a loja selecionada e os departamentos habilitados.
- Não exige estoque positivo.
- Exige registros de vendas em todas as datas do período analisado.
- Retorna até 10 produtos por consulta.

O parâmetro de alteração de preço está disponível na configuração. Sua geração e exibição no dashboard ainda precisam ser confirmadas na validação funcional.

## Validações realizadas

Os resultados abaixo registram verificações realizadas durante o desenvolvimento, sem representar cobertura completa de testes.

### Compras

- Conferência histórica de agosto de 2025 a setembro de 2026 para a Loja 1.
- 82.725 registros válidos de origem.
- 82.724 itens após consolidação de uma linha repetida.
- Nenhum produto ou fornecedor não encontrado nessa validação.
- Comparação mensal de quantidades, itens e valores calculados.

### Vendas

- Testes de consolidação e preservação de quantidades, valores e devoluções.
- Separação dos registros por loja, data e produto.
- Reimportação sem duplicidade.
- Rejeição de relatórios inválidos.
- Rollback com falha simulada de gravação.
- Resposta HTTP 422 do endpoint `/vendas/importar`.
- Validação de setembro de 2026: 395.727 registros de origem consolidados em 67.000 registros, com totais conferidos com o CSV original.

### Dashboard e configurações

- Teste de histórico insuficiente para cálculo da variação de vendas.
- Simulação de crescimento de 1.000 para 1.200 unidades, resultando em +20%.
- Persistência dos parâmetros de alertas e recuperação após atualizar a página.
- Conferência dos valores no PostgreSQL.
- Teste do alerta `SEM_VENDA` com histórico de 26/09/2026 a 30/09/2026, retornando 10 alertas sem erros de execução.
- Verificações de compilação Python e build do frontend com Vite.

## Ambiente atual e experiência em nuvem

Atualmente, o Compra360 é executado e desenvolvido localmente:

- Backend com FastAPI.
- Frontend com React/Vite.
- Banco de dados PostgreSQL.
- Versionamento com Git.

O projeto já foi implantado no Google Cloud, utilizando Cloud Run e Cloud SQL durante o período de avaliação da plataforma. Após o encerramento desse período, a execução retornou ao ambiente local.

A experiência em nuvem incluiu empacotamento com Docker, configuração dos serviços e integração entre aplicação e banco de dados.

A conexão com o PostgreSQL é configurada por variáveis de ambiente. O parâmetro `DB_SSLMODE` é opcional.

## Próximas etapas

- Concluir a seleção de período personalizado no dashboard.
- Validar o alerta de alteração de preço na interface.
- Ampliar os testes automatizados das regras críticas dos importadores.
- Expandir a importação e a validação dos dados das três lojas.
- Evoluir os indicadores e alertas gerenciais.
- Documentar o passo a passo de instalação e execução local.

## Estrutura do repositório

- [`backend/`](backend/) — API e regras de negócio.
- [`frontend/`](frontend/) — interface web.
- [`docs/`](docs/) — documentação complementar.

## Autor

**Everton Oliveira**  
Comprador Sênior e formado em Análise e Desenvolvimento de Sistemas.

[LinkedIn](https://www.linkedin.com/in/evertonooliveira/) · [GitHub](https://github.com/evertonoliveiralopes)

## Licença

Distribuído sob a licença [MIT](LICENSE).
