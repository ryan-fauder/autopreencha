/**
 * Validadores escritos de forma independente dos geradores (outra implementação, mesma especificação),
 * para que um erro no gerador não seja "confirmado" pelo próprio código.
 */
export const only = (s) => String(s).replace(/[^0-9A-Za-z]/g, '');
export const nums = (s) => only(s).split('').map(Number);

export function isCpf(value) {
  const d = nums(value);
  if (d.length !== 11 || new Set(d).size === 1) return false;
  for (const len of [9, 10]) {
    let s = 0;
    for (let i = 0; i < len; i++) s += d[i] * (len + 1 - i);
    if ((s * 10) % 11 % 10 !== d[len]) return false;
  }
  return true;
}

export function isCnpj(value) {
  const vals = [...only(value)].map((c) => c.charCodeAt(0) - 48);
  const calc = (len) => {
    const w = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const r = vals.slice(0, len).reduce((s, x, i) => s + x * w[i], 0) % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return vals.length === 14 && calc(12) === vals[12] && calc(13) === vals[13];
}

export function isLuhn(value) {
  let s = 0;
  [...only(value)].reverse().forEach((c, i) => {
    let d = Number(c);
    if (i % 2) { d *= 2; if (d > 9) d -= 9; }
    s += d;
  });
  return s % 10 === 0;
}

export function isIso7064(value) {
  let r = 0;
  for (const ch of only(value)) r = (r * 10 + Number(ch)) % 97;
  return r === 1;
}
