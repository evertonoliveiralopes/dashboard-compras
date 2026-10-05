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

- Refinar os períodos e comparações do dashboard.
- Evoluir os indicadores e alertas gerenciais.
- Criar testes automatizados para as regras críticas dos importadores.
- Continuar a validação dos dados antes da expansão das análises.
