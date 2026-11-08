/** Blocos de cálculo de dígitos verificadores, reutilizados pelos documentos. */

export const allEqual = (list) => list.every((x) => x === list[0]);

export const weightedSum = (values, weights) => values.reduce((sum, x, i) => sum + x * weights[i], 0);

/** Pesos decrescentes: descending(9, 2) → [9, 8, …, 2]. */
export const descending = (from, to) => Array.from({ length: from - to + 1 }, (_, i) => from - i);

/** Pesos crescentes: ascending(2, 9) → [2, 3, …, 9]. */
export const ascending = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** Módulo 11 clássico: resto < 2 vira 0, senão 11 − resto. */
export function mod11(sum) {
  const r = sum % 11;
  return r < 2 ? 0 : 11 - r;
}

/** Variante "soma × 10 mod 11" (RENAVAM, Caixa, algumas IEs): resto 10 vira 0. */
export function mod11Times10(values, weights) {
  const r = (weightedSum(values, weights) * 10) % 11;
  return r === 10 ? 0 : r;
}

/** Variante "11 − resto", com 10 e 11 virando 0. */
export function mod11Complement(values, weights) {
  const r = 11 - (weightedSum(values, weights) % 11);
  return r >= 10 ? 0 : r;
}

/** Dígito de Luhn para um número sem o dígito final (cartões). */
export function luhnDigit(payload) {
  let sum = 0;
  for (let i = 0; i < payload.length; i++) {
    let d = payload[payload.length - 1 - i];
    if (i % 2 === 0) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

/** Soma dos algarismos de cada produto, com pesos alternados (Itaú, IE-MG). */
export function digitSumAlternating(values, firstWeight, secondWeight) {
  return values.reduce((sum, x, i) => {
    const p = x * (i % 2 === 0 ? firstWeight : secondWeight);
    return sum + Math.floor(p / 10) + (p % 10);
  }, 0);
}

/** Dois dígitos verificadores ISO 7064 MOD 97-10 para uma sequência numérica. */
export function iso7064Mod97(numeric) {
  let r = 0;
  for (const ch of `${numeric}00`) r = (r * 10 + Number(ch)) % 97;
  return String(98 - r).padStart(2, '0');
}
