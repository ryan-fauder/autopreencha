/** Documentos de pessoa física com dígitos verificadores válidos. Todos retornam o valor com máscara. */
import { allEqual, ascending, descending, mod11, weightedSum } from '../checksum.js';
import { normalizeUf, randomUf } from '../geo.js';
import { digits, letter, pick, rand } from '../random.js';
import { applyMask, pad } from '../text.js';

// 9º dígito do CPF: região fiscal de emissão.
const CPF_REGION = {
  RS: 0, DF: 1, GO: 1, MS: 1, MT: 1, TO: 1, AC: 2, AM: 2, AP: 2, PA: 2, RO: 2, RR: 2,
  CE: 3, MA: 3, PI: 3, AL: 4, PB: 4, PE: 4, RN: 4, BA: 5, SE: 5, MG: 6, ES: 7, RJ: 7, SP: 8, PR: 9, SC: 9,
};

export function cpf(uf) {
  const u = normalizeUf(uf);
  let d;
  do {
    d = digits(9);
    if (u) d[8] = CPF_REGION[u];
  } while (allEqual(d));
  d.push(mod11(weightedSum(d, descending(10, 2))));
  d.push(mod11(weightedSum(d, descending(11, 2))));
  return applyMask(d.join(''), '###.###.###-##');
}

/** RG no padrão SSP-SP (o único com algoritmo público estável); DV pode ser "X". */
export function rg() {
  const d = digits(8);
  const r = 11 - (weightedSum(d, ascending(2, 9)) % 11);
  const dv = r === 10 ? 'X' : r === 11 ? '0' : String(r);
  return applyMask(d.join('') + dv, '##.###.###-#');
}

export function cnh() {
  let d, dv1, dv2;
  // Descarta os casos-limite (resto >= 10), em que os validadores populares divergem entre si.
  do {
    d = digits(9);
    dv1 = weightedSum(d, descending(9, 1)) % 11;
    dv2 = weightedSum(d, ascending(1, 9)) % 11;
  } while (allEqual(d) || d[0] === 0 || dv1 >= 10 || dv2 >= 10);
  return `${d.join('')}${dv1}${dv2}`;
}

export function pis() {
  let d;
  do { d = digits(10); } while (allEqual(d) || d[0] === 0);
  const r = 11 - (weightedSum(d, [3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) % 11);
  d.push(r >= 10 ? 0 : r);
  return applyMask(d.join(''), '###.#####.##-#');
}

/** Cartão Nacional de Saúde definitivo (inicia com 1 ou 2). */
export function cns() {
  const base = [rand(1, 2), ...digits(10)];
  let sum = weightedSum(base, descending(15, 5));
  let dv = 11 - (sum % 11);
  let middle = '000';
  if (dv === 11) dv = 0;
  if (dv === 10) {
    sum += 2;
    dv = 11 - (sum % 11);
    middle = '001';
  }
  return applyMask(`${base.join('')}${middle}${dv}`, '### #### #### ####');
}

const TITULO_UF = {
  SP: 1, MG: 2, RJ: 3, RS: 4, BA: 5, PR: 6, CE: 7, PE: 8, SC: 9, GO: 10, MA: 11, PB: 12, PA: 13, ES: 14,
  PI: 15, RN: 16, AL: 17, MT: 18, MS: 19, DF: 20, SE: 21, AM: 22, RO: 23, AC: 24, AP: 25, RR: 26, TO: 27,
};

export function tituloEleitor(uf) {
  const code = TITULO_UF[normalizeUf(uf) || randomUf()];
  const spOrMg = code === 1 || code === 2;
  // Regra do TSE: resto 10 vira 0; em SP e MG, resto 0 vira 1.
  const fix = (r) => (r === 10 ? 0 : r === 0 && spOrMg ? 1 : r);
  const seq = digits(8);
  const dv1 = fix(weightedSum(seq, ascending(2, 9)) % 11);
  const [u1, u2] = pad(code, 2).split('').map(Number);
  const dv2 = fix((u1 * 7 + u2 * 8 + dv1 * 9) % 11);
  return applyMask(`${seq.join('')}${pad(code, 2)}${dv1}${dv2}`, '#### #### ####');
}

export const passaporte = () => `${pick(['F', 'G', 'Y'])}${letter()}${digits(6).join('')}`;
