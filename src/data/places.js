/** Unidades federativas e cidades atendidas (com DDD). Os CEPs reais de cada cidade ficam em ceps.js. */

export const STATES = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
  ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};

export const UFS = Object.keys(STATES);

// [cidade, UF, DDD] — o nome precisa ser idêntico ao da base dos Correios (usado em scripts/build-ceps.mjs).
export const CITIES = [
  ['São Paulo', 'SP', '11'], ['Campinas', 'SP', '19'], ['Ribeirão Preto', 'SP', '16'],
  ['Rio de Janeiro', 'RJ', '21'], ['Niterói', 'RJ', '21'], ['Belo Horizonte', 'MG', '31'],
  ['Uberlândia', 'MG', '34'], ['Vitória', 'ES', '27'], ['Curitiba', 'PR', '41'], ['Londrina', 'PR', '43'],
  ['Florianópolis', 'SC', '48'], ['Joinville', 'SC', '47'], ['Porto Alegre', 'RS', '51'], ['Caxias do Sul', 'RS', '54'],
  ['Salvador', 'BA', '71'], ['Aracaju', 'SE', '79'], ['Maceió', 'AL', '82'], ['Recife', 'PE', '81'],
  ['João Pessoa', 'PB', '83'], ['Natal', 'RN', '84'], ['Fortaleza', 'CE', '85'], ['Teresina', 'PI', '86'],
  ['São Luís', 'MA', '98'], ['Belém', 'PA', '91'], ['Macapá', 'AP', '96'], ['Manaus', 'AM', '92'],
  ['Boa Vista', 'RR', '95'], ['Rio Branco', 'AC', '68'], ['Porto Velho', 'RO', '69'], ['Palmas', 'TO', '63'],
  ['Cuiabá', 'MT', '65'], ['Campo Grande', 'MS', '67'], ['Goiânia', 'GO', '62'], ['Brasília', 'DF', '61'],
].map(([city, uf, ddd]) => ({ city, uf, ddd }));

export const COMPLEMENTS = ['', '', '', 'Casa', 'Apto 101', 'Apto 302', 'Bloco B', 'Sala 5', 'Fundos', 'Casa 2'];
