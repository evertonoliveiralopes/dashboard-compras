# Compra360

Plataforma web para gestão estratégica de compras, vendas, estoque e fornecedores.

## Objetivo

O Compra360 centraliza dados operacionais do supermercado e os transforma em informações para apoio às decisões de compras, acompanhamento de vendas, estoque e fornecedores.

## Tecnologias

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic

### Frontend
- React
- Vite
- Material UI
- Recharts

### Infraestrutura
- Google Cloud Run
- Google Cloud SQL
- Secret Manager

## Módulos atuais

- Dashboard gerencial
- Produtos
- Fornecedores
- Entradas de mercadorias
- Vendas
- Departamentos
- Importação de relatórios
- Histórico de importações
- Controle por loja
- Autenticação via JWT

## Dashboard gerencial

O Dashboard centraliza os principais indicadores e análises para apoio à decisão de compras.
O cabeçalho possui layout responsivo para dispositivos móveis, mantendo o menu de navegação, a identificação da página, o seletor de loja e o acesso do usuário organizados sem sobreposição em telas menores.

O período selecionado no Dashboard é utilizado de forma integrada pelos indicadores e pelas análises de compras.

Períodos disponíveis:

- Mês;
- 3 meses;
- 6 meses;
- 12 meses;
- Personalizado.

As análises de compras incluem:

- evolução das compras por mês;
- Top 5 fornecedores por valor comprado;
- compras por departamento.

A evolução das compras utiliza mês e ano como referência, evitando a consolidação incorreta de meses pertencentes a anos diferentes.

Os valores de compras são calculados a partir de `quantidade × custo_unitario`.

Os indicadores do período atual são comparados com o período anterior equivalente quando aplicável.

## Importação de dados

O sistema possui importadores para os relatórios operacionais utilizados pelo Compra360.

A Central de Importações utiliza um fluxo único para os diferentes tipos de dados. O usuário seleciona o tipo de importação, escolhe o arquivo correspondente e executa o processamento pela mesma interface.

Tipos disponíveis:

- Produtos;
- Departamentos;
- Fornecedores;
- Entradas;
- Vendas.

O histórico de importações fica disponível na própria Central de Importações e é atualizado automaticamente após uma importação concluída com sucesso. O histórico não é exibido no dashboard, mantendo a tela gerencial focada em indicadores, análises e alertas.

### Entradas

O importador de entradas:

- suporta os layouts de 16 e 18 colunas do relatório Arius;
- normaliza códigos de produtos e fornecedores;
- identifica a entrada considerando nota fiscal, fornecedor e data de entrada;
- evita duplicação de entradas e itens já importados;
- consolida linhas repetidas do mesmo produto dentro da mesma entrada;
- utiliza a soma das quantidades e o custo médio ponderado na consolidação de itens repetidos;
- mantém a reimportação idempotente, sem somar novamente itens que já existiam antes da execução;
- utiliza cache em memória para reduzir consultas repetitivas ao banco;
- suporta equivalências conhecidas de códigos históricos de fornecedores;
- registra o resultado no histórico de importações.

### Fornecedores

O importador de fornecedores suporta variações de quantidade de campos encontradas no relatório Arius, preservando os dados cadastrais necessários para identificação dos fornecedores.

### Vendas

O sistema possui histórico de vendas utilizado nos indicadores e análises do dashboard.

## Base histórica validada

### Vendas

A Loja 1 possui histórico de vendas importado de agosto de 2025 a agosto de 2026.

### Compras

A Loja 1 possui histórico de compras validado de agosto de 2025 a setembro de 2026.

Os arquivos históricos utilizados na validação possuem:

- 82.725 registros válidos de compra;
- 82.724 itens de entrada após a consolidação;
- 1 linha consolidada por repetição do mesmo produto dentro da mesma entrada;
- 0 fornecedores não encontrados;
- 0 produtos não encontrados.

Quantidade de itens consolidados por mês:

| Mês | Itens |
| --- | ---: |
| Agosto/2025 | 5.289 |
| Setembro/2025 | 6.343 |
| Outubro/2025 | 6.493 |
| Novembro/2025 | 7.066 |
| Dezembro/2025 | 5.798 |
| Janeiro/2026 | 4.506 |
| Fevereiro/2026 | 5.611 |
| Março/2026 | 5.660 |
| Abril/2026 | 6.314 |
| Maio/2026 | 5.586 |
| Junho/2026 | 5.037 |
| Julho/2026 | 5.878 |
| Agosto/2026 | 6.937 |
| Setembro/2026 | 6.206 |
| **Total** | **82.724** |

A validação comparou os dados armazenados no banco com os relatórios históricos de origem, mês a mês, considerando quantidade, quantidade de itens consolidados e valor calculado.

O valor de compras utilizado pelo dashboard é calculado a partir de `quantidade × custo_unitario`. Por isso, pode haver pequenas diferenças em relação ao campo de valor total presente no relatório de origem.

Quando o mesmo produto aparece mais de uma vez na mesma nota fiscal, fornecedor e data de entrada, o Compra360 mantém um único item, soma as quantidades e calcula o custo médio ponderado.

Notas fiscais iguais do mesmo fornecedor em datas diferentes são tratadas como entradas distintas.

## Compatibilidade histórica de fornecedores

Alguns relatórios antigos podem utilizar códigos diferentes dos cadastros atuais.

Atualmente existe a equivalência:

- `20895` → `208959620` — EDY ALIMENTOS.

Transferências recebidas da Empresa 1 são registradas com o fornecedor técnico `E1 - EMPRESA 1 - TRANSFERENCIA ENTRE LOJAS`, pois representam entradas de mercadoria com custo para a loja recebedora.

## Próximas etapas

- Concluir o período personalizado do dashboard com seleção de data inicial e final.
- Evoluir os indicadores e alertas gerenciais.
- Criar testes automatizados para as regras críticas dos importadores.
- Continuar a validação dos dados antes da expansão das análises.

## Ambiente de desenvolvimento local

A partir de outubro de 2026, o desenvolvimento do Compra360 será realizado localmente, sem depender dos serviços do Google Cloud.

- Backend: FastAPI executado na máquina de desenvolvimento.
- Frontend: React/Vite executado localmente.
- Banco de dados: PostgreSQL local.
- Versionamento: Git.

A infraestrutura anteriormente utilizada no Google Cloud permanece documentada como referência histórica, mas não é necessária para o desenvolvimento local.

A configuração de conexão com o PostgreSQL será realizada por variáveis de ambiente. O parâmetro DB_SSLMODE é opcional.

### Consolidação de vendas — Em desenvolvimento

O objetivo é preservar pelo menos seis meses de histórico de vendas das três lojas, reduzindo o armazenamento necessário.

Foi criada a função consolidar_vendas(), que agrupa registros por loja, data e código do produto, somando quantidades e valores vendidos.

Dois testes automatizados foram executados com sucesso, validando:

- Preservação de quantidades, faturamento e devoluções negativas.
- Separação dos registros por loja, data e produto.

A função ainda não está integrada ao importador de produção.

Como os relatórios do Arius podem conter vendas já apresentadas em relatórios anteriores, o tratamento seguro de reimportações ainda precisa ser implementado.

Nenhuma migração ou substituição de registros históricos foi realizada por essa funcionalidade.

### Próximas atividades do ambiente local

- Validar a conexão com o PostgreSQL instalado na máquina.
- Verificar a estrutura e os dados do banco local existente.
- Concluir a consolidação e a proteção contra duplicidade na importação de vendas.
- Importar e validar os dados das três lojas.
- Executar e validar backend e frontend localmente.


## Importa??o consolidada de vendas

O Compra360 importa relat?rios anal?ticos de vendas do Arius por loja.

### Regras de processamento

- Leitura de CSV com separador `;`, codifica??o Latin-1 e campos preservados como texto.
- Valida??o integral do relat?rio antes de substituir vendas existentes.
- Consolida??o por loja, data e c?digo do produto.
- Utiliza??o de `Decimal` para preservar a precis?o de quantidades e valores.
- Preserva??o de vendas negativas e devolu??es.
- Substitui??o somente dos dias presentes no relat?rio da loja selecionada.
- Identifica??o determin?stica dos registros consolidados.
- Grava??o das vendas e do hist?rico em uma ?nica transa??o.
- Rollback em caso de falha, evitando importa??es parcialmente confirmadas.

### Reimporta??o

Os relat?rios do Arius devem conter todas as vendas dos dias selecionados.

Ao reimportar um per?odo, os registros anteriores desses dias e dessa loja
s?o substitu?dos pelos novos dados consolidados, sem duplicar o faturamento.

### Valida??es realizadas

- Testes automatizados de consolida??o aprovados.
- Confer?ncia dos totais do relat?rio real de setembro de 2026.
- Teste de reimporta??o sem duplicidade.
- Rejei??o de relat?rios inv?lidos.
- Teste de rollback com falha simulada de grava??o.
- Teste HTTP 422 do endpoint `/vendas/importar`.


### Validacao da importacao de vendas - Outubro/2026

- Frontend local envia o CSV completo em uma unica requisicao.
- Removido o fracionamento em blocos de 4 MB, anteriormente utilizado no Cloud Run.
- Backend consolida vendas por loja, data e produto.
- Reimportacao substitui registros existentes das datas presentes no arquivo.
- Teste real: setembro/2026, Loja 001.
- Registros originais: 395.727.
- Registros consolidados: 67.000.
- Quantidade vendida: 377.250,250.
- Faturamento liquido: R$ 2.567.791,94.
- Resultado: totais conferidos com o CSV original.

## Indicador de Variacao de Vendas - Ultimos 30 Dias

O Dashboard apresenta um indicador de variacao percentual da quantidade vendida.

### Regra de calculo

- Periodo atual: ultimos 30 dias corridos, incluindo a data atual.
- Periodo anterior: 30 dias imediatamente anteriores.
- Metrica: quantidade vendida.
- Formula: ((quantidade atual - quantidade anterior) / quantidade anterior) * 100.
- O indicador independe do filtro de periodo selecionado no Dashboard.
- O indicador Quantidade Vendida continua respeitando o filtro selecionado.

### Tratamento de dados insuficientes

- O calculo exige registros de vendas em todos os 30 dias de cada intervalo.
- Se faltar algum dia ou a quantidade anterior for zero, a API retorna null.
- O frontend apresenta um traco e um icone cinza quando nao existe variacao calculavel.
- A verificacao de dias com registros nao garante, isoladamente, a integridade das importacoes.

### Validacoes realizadas

- Compilacao Python do modulo Dashboard.
- Teste com historico insuficiente.
- Teste simulado de crescimento de 1.000 para 1.200 unidades: +20%.
- Compilacao de producao do frontend com Vite.

## Configuracao de Alertas por Usuario

O Compra360 permite que cada usuario configure individualmente os tipos de alertas e os departamentos monitorados.

### Tipos de alertas configuraveis

- Alteracao de preco de compra: habilitar ou desabilitar e definir o percentual minimo de variacao.
- Estoque minimo: habilitar ou desabilitar e definir a quantidade minima, incluindo valores fracionarios.
- Produto sem movimentacao: habilitar ou desabilitar e definir a quantidade minima de dias sem venda.

### Valores padrao

| Parametro | Valor padrao |
| --- | ---: |
| Variacao minima de preco | 10% |
| Quantidade minima de estoque | 20 |
| Dias sem venda | 30 |

### Persistencia e validacoes

- As preferencias sao vinculadas ao usuario autenticado.
- Os departamentos monitorados sao armazenados separadamente dos tipos de alertas.
- As configuracoes sao carregadas pela API ao abrir a tela.
- Os parametros numericos sao salvos no PostgreSQL e recuperados apos atualizar a pagina.
- O percentual de preco deve estar entre 0 e 100.
- A quantidade minima de estoque deve ser maior ou igual a zero.
- Os dias sem venda devem ser um numero inteiro maior ou igual a 1.
- A migracao Alembic `191127f58bc6` adiciona os tres parametros numericos a tabela `config_tipos_alertas`.

### Validacoes realizadas

- Migracao aplicada e estrutura conferida no PostgreSQL local.
- Modelo SQLAlchemy e schemas Pydantic validados.
- Testes do servico para valores padrao e personalizados.
- Compilacao de producao do frontend com Vite.
- Salvamento pela interface e recuperacao apos atualizar a pagina.
- Consulta direta ao PostgreSQL confirmou os valores personalizados do usuario.

### Integracao pendente

As configuracoes estao persistidas e disponiveis pela API, mas ainda precisam ser aplicadas as regras de geracao dos alertas apresentados no Dashboard, respeitando os tipos habilitados, os limites definidos, os departamentos selecionados e a loja em consulta.


## Alertas do Dashboard

O dashboard utiliza as configurações individuais de cada usuário
para identificar situações que exigem atenção.

### Alertas disponíveis

- SEM_ESTOQUE: produtos com estoque abaixo do limite configurado.
- SEM_CUSTO: produtos com custo igual ou inferior a zero.
- SEM_COMPRA: produtos sem entrada de compra identificada.
- SEM_VENDA: produtos sem vendas no período configurado.

### Alerta SEM_VENDA

- Utiliza a quantidade de dias definida pelo usuário.
- Considera somente dias completos, excluindo a data atual.
- Respeita a loja selecionada e os departamentos habilitados.
- Não exige estoque positivo, pois a falta de estoque pode explicar
  a ausência de vendas.
- Só é gerado quando existem registros de vendas em todas as datas
  do período analisado.
- Retorna até 10 produtos por consulta.

### Validação

O alerta SEM_VENDA foi testado com dados históricos da loja 1,
utilizando o período de 26/09/2026 a 30/09/2026.

Resultado: 10 alertas SEM_VENDA, sem erros de execução.
