/**
 * Inscrição Estadual — padrão Strategy: cada UF tem seu próprio algoritmo (tabela do SINTEGRA),
 * registrado em STRATEGIES. inscricaoEstadual(uf) só escolhe a estratégia.
 */
import {
  descending, ascending, digitSumAlternating, mod11, mod11Complement, mod11Times10, weightedSum,
} from '../checksum.js';
import { normalizeUf, randomUf } from '../geo.js';
import { digits, pick, rand } from '../random.js';
import { applyMask, pad } from '../text.js';

const dv11 = (values, weights) => mod11(weightedSum(values, weights));

/** 8 dígitos (prefixo + aleatórios) e 1 DV módulo 11 com pesos 9..2 — o caso mais comum. */
const generic9 = (prefix, mask) => () => {
  const head = prefix();
  const base = [...head, ...digits(8 - head.length)];
  return applyMask(base.join('') + dv11(base, descending(9, 2)), mask);
};
const fixed = (...values) => () => values;

const STRATEGIES = {
  AC() {
    const b = [0, 1, ...digits(9)];
    b.push(mod11Complement(b, [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
    b.push(mod11Complement(b, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
    return applyMask(b.join(''), '##.###.###/###-##');
  },
  AL() {
    const b = [2, 4, pick([0, 3, 5, 7, 8]), ...digits(5)];
    return b.join('') + mod11Times10(b, descending(9, 2));
  },
  AP() {
    // Faixa acima de 03019022, onde os fatores p e d do algoritmo valem 0.
    const b = [0, 3, rand(1, 9), ...digits(5)];
    return b.join('') + mod11Complement(b, descending(9, 2));
  },
  AM: generic9(() => [rand(0, 9)], '##.###.###-#'),
  BA() {
    const b = digits(6);
    const modulo = [6, 7, 9].includes(b[0]) ? 11 : 10;
    const calc = (values, weights) => {
      const s = weightedSum(values, weights);
      if (modulo === 10) return s % 10 === 0 ? 0 : 10 - (s % 10);
      return mod11(s);
    };
    const dv2 = calc(b, descending(7, 2));
    const dv1 = calc([...b, dv2], descending(8, 2));
    return applyMask(`${b.join('')}${dv1}${dv2}`, '######-##');
  },
  CE: generic9(fixed(0, 6), '########-#'),
  DF() {
    const b = [0, 7, ...digits(9)];
    b.push(mod11Complement(b, [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
    b.push(mod11Complement(b, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
    return applyMask(b.join(''), '###########-##');
  },
  ES: generic9(fixed(0, 8), '###.###.##-#'),
  GO() {
    const b = [1, pick([0, 1, 5]), ...digits(6)];
    const n = Number(b.join(''));
    const r = weightedSum(b, descending(9, 2)) % 11;
    const dv = r === 0 ? 0 : r === 1 ? (n >= 10103105 && n <= 10119997 ? 1 : 0) : 11 - r;
    return applyMask(b.join('') + dv, '##.###.###-#');
  },
  MA: generic9(fixed(1, 2), '#########'),
  MT() {
    const b = digits(10);
    return applyMask(b.join('') + dv11(b, [3, 2, 9, 8, 7, 6, 5, 4, 3, 2]), '##########-#');
  },
  MS: generic9(fixed(2, 8), '#########'),
  MG() {
    const b = digits(11); // 3 município + 6 sequencial + 2 ordem
    const withZero = [...b.slice(0, 3), 0, ...b.slice(3)];
    const dv1 = (10 - (digitSumAlternating(withZero, 1, 2) % 10)) % 10;
    const dv2 = dv11([...b, dv1], [3, 2, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
    return applyMask(`${b.join('')}${dv1}${dv2}`, '###.###.###/####');
  },
  PA: generic9(fixed(1, 5), '##-######-#'),
  PB: generic9(fixed(1, 6), '########-#'),
  PR() {
    const b = digits(8);
    b.push(dv11(b, [3, 2, 7, 6, 5, 4, 3, 2]));
    b.push(dv11(b, [4, 3, 2, 7, 6, 5, 4, 3, 2]));
    return applyMask(b.join(''), '########-##');
  },
  PE() {
    const b = digits(7);
    b.push(dv11(b, descending(8, 2)));
    b.push(dv11(b, descending(9, 2)));
    return applyMask(b.join(''), '#######-##');
  },
  PI: generic9(fixed(1, 9), '#########'),
  RJ() {
    const b = digits(7);
    return applyMask(b.join('') + dv11(b, [2, 7, 6, 5, 4, 3, 2]), '##.###.##-#');
  },
  RN() {
    const b = [2, 0, ...digits(6)];
    return applyMask(b.join('') + mod11Times10(b, descending(9, 2)), '##.###.###-#');
  },
  RS() {
    const b = [...pad(rand(1, 467), 3).split('').map(Number), ...digits(6)];
    return applyMask(b.join('') + mod11Complement(b, [2, 9, 8, 7, 6, 5, 4, 3, 2]), '###/#######');
  },
  RO() {
    let b, r;
    // Resto 1 é tratado de forma diferente entre validadores; evita esse caso.
    do {
      b = [rand(1, 9), ...digits(12)];
      r = weightedSum(b, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) % 11;
    } while (r === 1);
    return applyMask(b.join('') + (r === 0 ? 1 : 11 - r), '#############-#');
  },
  RR() {
    const b = [2, 4, ...digits(6)];
    return applyMask(b.join('') + (weightedSum(b, ascending(1, 8)) % 9), '########-#');
  },
  SC: generic9(fixed(2, 5), '###.###.###'),
  SP() {
    const b = digits(8);
    const dv1 = (weightedSum(b, [1, 3, 4, 5, 6, 7, 8, 10]) % 11) % 10;
    const b2 = [...b, dv1, ...digits(2)];
    const dv2 = (weightedSum(b2, [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2]) % 11) % 10;
    return applyMask(b2.join('') + dv2, '###.###.###.###');
  },
  SE: generic9(fixed(2, 7), '##.###.###-#'),
  TO() {
    // Formato de 11 dígitos: os dígitos 3 e 4 (tipo de empresa) não entram no cálculo.
    const b = [2, 9, ...digits(6)];
    const tipo = pick(['01', '02', '03', '99']);
    return applyMask(`${b.slice(0, 2).join('')}${tipo}${b.slice(2).join('')}${dv11(b, descending(9, 2))}`, '##.##.######-#');
  },
};

export const SUPPORTED_UFS = Object.keys(STRATEGIES);

export function inscricaoEstadual(uf) {
  return STRATEGIES[normalizeUf(uf) || randomUf()]();
}
