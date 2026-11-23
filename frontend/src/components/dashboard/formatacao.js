export const moedaBR = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format;
export const numeroBR = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format;
export const percentualBR = new Intl.NumberFormat("pt-BR", {
  style: "percent", signDisplay: "exceptZero", maximumFractionDigits: 1,
}).format;

const dataBR = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function formatarIntervalo(inicio, fimExclusivo) {
  const inicioPeriodo = new Date(inicio);
  const fimPeriodo = new Date(fimExclusivo);
  fimPeriodo.setUTCDate(fimPeriodo.getUTCDate() - 1);
  const primeiraData = dataBR.format(inicioPeriodo);
  const ultimaData = dataBR.format(fimPeriodo);
  return primeiraData === ultimaData ? primeiraData : primeiraData + " a " + ultimaData;
}
