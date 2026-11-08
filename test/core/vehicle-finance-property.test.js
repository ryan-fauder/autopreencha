import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARD_BRANDS, cartao, contaBancaria } from '../../src/core/finance.js';
import { matriculaCnm } from '../../src/core/property.js';
import { chassi, placa, placaMercosul, renavam } from '../../src/core/vehicle.js';
import { isIso7064, isLuhn, nums, only } from '../validators.js';

const N = 3000;
const times = (fn) => { for (let i = 0; i < N; i++) fn(); };

test('RENAVAM', () => times(() => {
  const d = nums(renavam());
  const r = (d.slice(0, 10).reduce((s, x, i) => s + x * [3, 2, 9, 8, 7, 6, 5, 4, 3, 2][i], 0) * 10) % 11;
  assert.equal(d[10], r === 10 ? 0 : r);
}));

test('Placas: antiga só até a série SAV; Mercosul no formato ABC1D23', () => times(() => {
  const antiga = placa();
  assert.match(antiga, /^[A-Z]{3}-\d{4}$/);
  assert.ok(antiga.slice(0, 3) < 'SAW', antiga);
  assert.match(placaMercosul(), /^[A-Z]{3}\d[A-Z]\d{2}$/);
}));

test('Chassi tem 17 caracteres sem I, O, Q', () => times(() => assert.match(chassi(), /^[A-HJ-NPR-Z0-9]{17}$/)));

test('Cartões passam no Luhn e têm o tamanho e o CVV da bandeira', () => {
  for (const [key, brand] of Object.entries(CARD_BRANDS)) {
    times(() => {
      const c = cartao(key, 'Ana Silva');
      assert.equal(only(c.numero).length, brand.length, key);
      assert.ok(isLuhn(c.numero), `${key} ${c.numero}`);
      assert.equal(c.cvv.length, brand.cvv);
      assert.match(c.validade, /^(0[1-9]|1[0-2])\/\d{2}$/);
      assert.equal(c.nome, 'ANA SILVA');
    });
  }
});

test('Conta Banco do Brasil', () => times(() => {
  const c = contaBancaria('001');
  const dvBB = (str) => {
    const d = nums(str);
    const r = 11 - (d.reduce((s, x, i) => s + x * (d.length + 1 - i), 0) % 11);
    return r === 10 ? 'X' : r === 11 ? '0' : String(r);
  };
  const [ag, agDv] = c.agencia.split('-');
  const [ct, ctDv] = c.conta.split('-');
  assert.equal(agDv, dvBB(ag));
  assert.equal(ctDv, dvBB(ct));
  assert.equal(c.oficial, true);
}));

test('Conta Itaú (módulo 10 sobre agência + conta)', () => times(() => {
  const c = contaBancaria('341');
  const [ct, dv] = c.conta.split('-');
  let s = 0;
  nums(c.agencia + ct).forEach((x, i) => { const p = x * (i % 2 === 0 ? 2 : 1); s += Math.floor(p / 10) + (p % 10); });
  assert.equal(Number(dv), (10 - (s % 10)) % 10);
}));

test('Contas Bradesco e Caixa no formato esperado; bancos sem algoritmo marcados como genéricos', () => times(() => {
  assert.match(contaBancaria('237').conta, /^\d{7}-[\dP]$/);
  assert.match(contaBancaria('104').conta, /^(001|013)\.\d{8}-\d$/);
  assert.equal(contaBancaria('260').oficial, false);
}));

test('CNM (matrícula de imóvel) passa no ISO 7064 MOD 97-10', () => times(() => {
  const v = matriculaCnm();
  assert.match(v, /^\d{6}\.2\.\d{7}-\d{2}$/);
  assert.ok(isIso7064(v), v);
}));
