/**
 * Fonte única de aleatoriedade do domínio.
 *
 * Por padrão usa Math.random. Os testes chamam useSeed() para obter uma sequência reproduzível
 * (gerador mulberry32), sem que nenhum gerador precise receber a fonte por parâmetro.
 */

let source = Math.random;

export function useSeed(seed) {
  let a = seed >>> 0;
  source = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function useMathRandom() {
  source = Math.random;
}

/** Número real em [0, 1). */
export const random = () => source();

/** Inteiro em [min, max], extremos incluídos. */
export const rand = (min, max) => Math.floor(source() * (max - min + 1)) + min;

export const pick = (list) => list[rand(0, list.length - 1)];

/** Sorteia um item diferente de `not` (a lista precisa ter ao menos dois valores distintos). */
export function pickOther(list, not) {
  let value;
  do { value = pick(list); } while (value === not);
  return value;
}

export const digits = (count) => Array.from({ length: count }, () => rand(0, 9));

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const letter = () => LETTERS[rand(0, LETTERS.length - 1)];
