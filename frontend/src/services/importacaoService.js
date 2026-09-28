import api from "./api";

export async function importarProdutos(arquivo, lojaId) {
  const formData = new FormData();

  formData.append("arquivo", arquivo);

  const response = await api.post(
    "/produtos/importar",
    formData,
    {
      params: {
        loja_id: lojaId,
      },
    }
  );

  return response.data;
}

export async function importarDepartamentos(arquivo) {
  const formData = new FormData();

  formData.append("arquivo", arquivo);

  const response = await api.post(
    "/departamentos/importar",
    formData
  );

  return response.data;
}

export async function importarFornecedores(arquivo) {
  const formData = new FormData();

  formData.append("arquivo", arquivo);

  const response = await api.post(
    "/fornecedores/importar",
    formData
  );

  return response.data;
}

export async function importarEntradas(arquivo, lojaId) {
  const formData = new FormData();

  formData.append("arquivo", arquivo);

  const response = await api.post(
    "/entradas/importar",
    formData,
    {
      params: {
        loja_id: lojaId,
      },
    }
  );

  return response.data;
}

export async function importarVendas(arquivo, lojaId) {
  /*
   * O Cloud Run possui limite de tamanho para uma requisição.
   *
   * Arquivos grandes de vendas são divididos no navegador
   * em partes de aproximadamente 4 MB.
   *
   * Trabalhamos diretamente com os bytes originais para
   * preservar o arquivo Latin-1 utilizado pelo backend.
   */

  const buffer = await arquivo.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const TAMANHO_PARTE = 4 * 1024 * 1024;

  /*
   * Procura o primeiro LF.
   * Tudo antes dele corresponde ao cabeçalho.
   */
  let fimCabecalho = -1;

  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 10) {
      fimCabecalho = i + 1;
      break;
    }
  }

  if (fimCabecalho === -1) {
    throw new Error(
      "Arquivo de vendas inválido: cabeçalho não encontrado."
    );
  }

  const cabecalho = bytes.slice(
    0,
    fimCabecalho
  );

  const partes = [];

  let inicioDados = fimCabecalho;

  /*
   * Divide o arquivo em blocos.
   *
   * Cada bloco começa no início de uma linha e termina
   * depois de um LF. Dessa forma não cortamos uma venda
   * no meio do registro.
   */
  while (inicioDados < bytes.length) {
    let fimDados =
      Math.min(
        inicioDados + TAMANHO_PARTE,
        bytes.length
      );

    /*
     * Se ainda não chegamos ao final do arquivo,
     * procura o próximo LF para completar a última
     * linha da parte.
     */
    if (fimDados < bytes.length) {
      while (
        fimDados < bytes.length &&
        bytes[fimDados] !== 10
      ) {
        fimDados++;
      }

      if (fimDados < bytes.length) {
        fimDados++;
      }
    }

    const dadosParte = bytes.slice(
      inicioDados,
      fimDados
    );

    partes.push(
      new Blob(
        [
          cabecalho,
          dadosParte,
        ],
        {
          type: "text/csv",
        }
      )
    );

    inicioDados = fimDados;
  }

  if (partes.length === 0) {
    throw new Error(
      "Arquivo de vendas não possui registros para importar."
    );
  }

  console.log(
    `Arquivo de vendas dividido em ${partes.length} partes.`
  );

  let totalInseridos = 0;
  let totalErros = 0;
  let totalAtualizados = 0;

  /*
   * Envia uma parte por vez.
   */
  for (let i = 0; i < partes.length; i++) {
    const numeroParte = i + 1;

    console.log(
      `Enviando parte ${numeroParte} de ${partes.length}...`
    );

    const nomeParte =
      `${arquivo.name}.parte-${numeroParte}-de-${partes.length}.csv`;

    const formData = new FormData();

    formData.append(
      "arquivo",
      partes[i],
      nomeParte
    );

    try {
      const response = await api.post(
        "/vendas/importar",
        formData,
        {
          params: {
            loja_id: lojaId,
          },
        }
      );

      const dados = response.data;

      totalInseridos += Number(
        dados.inseridos ||
          dados.registros_importados ||
          0
      );

      totalAtualizados += Number(
        dados.atualizados || 0
      );

      totalErros += Number(
        dados.erros || 0
      );

      console.log(
        `Parte ${numeroParte} concluída.`
      );
    } catch (error) {
      const detalhe =
        error.response?.data?.detail ||
        error.message ||
        "Erro desconhecido";

      throw new Error(
        `Erro ao importar a parte ${numeroParte} de ${partes.length}: ${detalhe}`
      );
    }
  }

  return {
    status: "ok",
    registros_importados: totalInseridos,
    inseridos: totalInseridos,
    atualizados: totalAtualizados,
    erros: totalErros,
    partes_processadas: partes.length,
  };
}