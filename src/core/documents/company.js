/** Documentos de pessoa jurídica. */
import { allEqual, mod11, weightedSum } from '../checksum.js';
import { digits, pick } from '../random.js';
import { applyMask } from '../text.js';

const CNPJ_MASK = '##.###.###/####-##';

/** Valor de cada caractere = código ASCII − 48, regra que vale para o CNPJ numérico e o alfanumérico. */
function cnpjCheckDigits(chars) {
  const values = chars.map((c) => c.charCodeAt(0) - 48);
  const dv1 = mod11(weightedSum(values, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
  const dv2 = mod11(weightedSum([...values, dv1], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
  return `${dv1}${dv2}`;
}

export function cnpj() {
  let root;
  do { root = digits(8); } while (allEqual(root));
  const chars = [...root.map(String), '0', '0', '0', '1'];
  return applyMask(chars.join('') + cnpjCheckDigits(chars), CNPJ_MASK);
}

/** CNPJ alfanumérico (IN RFB 2.229/2024). Garante ao menos uma letra na raiz. */
export function cnpjAlfanumerico() {
  const ALNUM = [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  let chars;
  do {
    chars = [...Array.from({ length: 8 }, () => pick(ALNUM)), '0', '0', '0', '1'];
  } while (!chars.some((c) => /[A-Z]/.test(c)));
  return applyMask(chars.join('') + cnpjCheckDigits(chars), CNPJ_MASK);
}
