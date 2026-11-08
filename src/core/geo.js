/** Localidades: UF, cidade, CEP real, endereço e telefones coerentes entre si. */
import { CITIES, COMPLEMENTS, STATES, UFS } from '../data/places.js';
import { CEPS } from '../data/ceps.js';
import { digits, pick, rand } from './random.js';
import { applyMask } from './text.js';

/** Devolve a sigla em maiúsculas se for uma UF válida; senão null. */
export function normalizeUf(uf) {
  const upper = typeof uf === 'string' ? uf.toUpperCase() : '';
  return STATES[upper] ? upper : null;
}

export const randomUf = () => pick(UFS);

export function randomCity(uf) {
  const u = normalizeUf(uf);
  return pick(u ? CITIES.filter((c) => c.uf === u) : CITIES);
}

/** CEPs reais da cidade (ver data/ceps.js). */
const cepsOf = (city) => CEPS[`${city.city}|${city.uf}`];

/** Número de imóvel dentro da faixa do CEP, respeitando o lado (par/ímpar) quando houver. */
function houseNumber(min, max, parity) {
  const top = Math.min(max, min + 3000);
  if (!parity) return rand(min, top);
  const wantsEven = parity === 'par';
  const first = (min % 2 === 0) === wantsEven ? min : min + 1;
  if (first > top) return min;
  return first + 2 * rand(0, Math.floor((top - first) / 2));
}

export function cep(uf) {
  const [code] = pick(cepsOf(randomCity(uf)));
  return applyMask(code, '#####-###');
}

export function address(uf) {
  const city = randomCity(uf);
  const [code, logradouro, bairro, min, max, parity] = pick(cepsOf(city));
  const numero = String(houseNumber(min, max, parity));
  const complemento = pick(COMPLEMENTS);
  const cepFormatado = applyMask(code, '#####-###');
  return {
    logradouro,
    numero,
    complemento,
    bairro,
    cidade: city.city,
    uf: city.uf,
    estado: STATES[city.uf],
    cep: cepFormatado,
    ddd: city.ddd,
    completo: `${logradouro}, ${numero}${complemento ? ` - ${complemento}` : ''} - ${bairro}, ${city.city} - ${city.uf}, ${cepFormatado}`,
  };
}

export const dddOf = (uf) => randomCity(uf).ddd;

export const celular = (ddd = dddOf()) => `(${ddd}) 9${rand(6, 9)}${digits(3).join('')}-${digits(4).join('')}`;

export const telefone = (ddd = dddOf()) => `(${ddd}) ${rand(2, 5)}${digits(3).join('')}-${digits(4).join('')}`;
