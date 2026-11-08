/** Registros de imóvel: inscrição de IPTU e Código Nacional de Matrícula. */
import { iso7064Mod97, mod11, weightedSum } from './checksum.js';
import { digits, rand } from './random.js';
import { applyMask, pad } from './text.js';

/** Formato genérico de inscrição municipal (cada prefeitura tem o seu; não há padrão nacional). */
export function inscricaoIptu() {
  const b = digits(10);
  return applyMask(b.join('') + mod11(weightedSum(b, [3, 2, 9, 8, 7, 6, 5, 4, 3, 2])), '###.###.####-#');
}

/**
 * Código Nacional de Matrícula (Provimento CNJ 143/2023):
 * CNS do cartório (6) + livro 2 (1) + número da matrícula (7) + DV ISO 7064 MOD 97-10 (2).
 */
export function matriculaCnm(cnsCartorio = pad(rand(100000, 199999), 6), numero = rand(1, 250000)) {
  const base = `${cnsCartorio}2${pad(numero, 7)}`;
  return applyMask(base + iso7064Mod97(base), '######.#.#######-##');
}
