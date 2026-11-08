/**
 * Cartões e contas bancárias.
 *
 * Padrão Strategy em dois pontos: CARD_BRANDS descreve cada bandeira (prefixos, tamanho, CVV) e
 * ACCOUNT_STRATEGIES guarda o algoritmo oficial de DV de cada banco que o publica.
 */
import { BANKS } from '../data/banks.js';
import { descending, luhnDigit, mod11, mod11Times10, weightedSum, digitSumAlternating } from './checksum.js';
import { fullName } from './people.js';
import { digits, pick, rand } from './random.js';
import { applyMask, pad, stripAccents } from './text.js';

export const CARD_BRANDS = {
  visa: { label: 'Visa', prefixes: ['4'], length: 16, cvv: 3 },
  mastercard: { label: 'Mastercard', prefixes: ['51', '52', '53', '54', '55', '2221', '2300', '2500', '2720'], length: 16, cvv: 3 },
  elo: { label: 'Elo', prefixes: ['636368', '438935', '504175', '451416', '636297', '506699', '509048', '650031'], length: 16, cvv: 3 },
  amex: { label: 'American Express', prefixes: ['34', '37'], length: 15, cvv: 4 },
  hipercard: { label: 'Hipercard', prefixes: ['606282'], length: 16, cvv: 3 },
  diners: { label: 'Diners Club', prefixes: ['36', '38'], length: 14, cvv: 3 },
  discover: { label: 'Discover', prefixes: ['6011', '65'], length: 16, cvv: 3 },
  jcb: { label: 'JCB', prefixes: ['3528', '3589'], length: 16, cvv: 3 },
};

const CARD_MASKS = { 14: '#### ###### ####', 15: '#### ###### #####', 16: '#### #### #### ####' };

export function cartao(brandKey, holderName = fullName(), today = new Date()) {
  const key = CARD_BRANDS[brandKey] ? brandKey : pick(Object.keys(CARD_BRANDS));
  const brand = CARD_BRANDS[key];
  const prefix = pick(brand.prefixes).split('').map(Number);
  const payload = [...prefix, ...digits(brand.length - prefix.length - 1)];
  const expiry = new Date(today.getFullYear() + rand(1, 6), rand(0, 11), 1);
  const month = pad(expiry.getMonth() + 1, 2);
  return {
    bandeira: brand.label,
    bandeiraKey: key,
    numero: applyMask(payload.join('') + luhnDigit(payload), CARD_MASKS[brand.length]),
    nome: stripAccents(holderName).toUpperCase(),
    validade: `${month}/${String(expiry.getFullYear()).slice(2)}`,
    validadeIso: `${expiry.getFullYear()}-${month}`,
    cvv: digits(brand.cvv).join(''),
  };
}

/** DV "11 − resto" em que 10 e 11 viram letras/zero conforme o banco. */
const complementDv = (values, weights, ten) => {
  const r = 11 - (weightedSum(values, weights) % 11);
  return r === 10 ? ten : r === 11 ? '0' : String(r);
};

const ACCOUNT_STRATEGIES = {
  // Banco do Brasil
  '001'() {
    const ag = digits(4);
    const ct = [rand(1, 9), ...digits(7)];
    return { agencia: `${ag.join('')}-${complementDv(ag, [5, 4, 3, 2], 'X')}`, conta: `${ct.join('')}-${complementDv(ct, descending(9, 2), 'X')}` };
  },
  // Bradesco
  '237'() {
    const ag = digits(4);
    const ct = digits(7);
    return { agencia: `${ag.join('')}-${complementDv(ag, [5, 4, 3, 2], 'P')}`, conta: `${ct.join('')}-${complementDv(ct, [2, 7, 6, 5, 4, 3, 2], 'P')}` };
  },
  // Itaú: módulo 10 sobre agência + conta
  '341'() {
    const ag = digits(4);
    const ct = digits(5);
    const dv = (10 - (digitSumAlternating([...ag, ...ct], 2, 1) % 10)) % 10;
    return { agencia: ag.join(''), conta: `${ct.join('')}-${dv}` };
  },
  // Caixa: agência + operação + conta
  '104'() {
    const ag = digits(4);
    const op = pick([[0, 0, 1], [0, 1, 3]]);
    const ct = [0, 0, 0, ...digits(5)];
    const dv = mod11Times10([...ag, ...op, ...ct], [8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return { agencia: ag.join(''), conta: `${op.join('')}.${ct.join('')}-${dv}` };
  },
};

/** Bancos que não publicam o algoritmo recebem DV módulo 11 genérico. */
function genericAccount() {
  const ct = digits(rand(6, 9));
  const weights = ct.map((_, i) => (i % 8) + 2).reverse();
  return { agencia: pad(rand(1, 9999), 4), conta: `${ct.join('')}-${mod11(weightedSum(ct, weights))}` };
}

export function contaBancaria(bankCode) {
  const bank = BANKS.find((b) => b.code === bankCode) || pick(BANKS);
  const strategy = ACCOUNT_STRATEGIES[bank.code];
  return {
    banco: `${bank.code} - ${bank.name}`,
    codigo: bank.code,
    nomeBanco: bank.name,
    tipo: pick(['Conta corrente', 'Conta poupança']),
    oficial: Boolean(strategy),
    ...(strategy ? strategy() : genericAccount()),
  };
}
