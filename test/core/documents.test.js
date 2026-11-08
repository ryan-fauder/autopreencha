import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cnpj, cnpjAlfanumerico } from '../../src/core/documents/company.js';
import { SUPPORTED_UFS, inscricaoEstadual } from '../../src/core/documents/inscricao-estadual.js';
import { cnh, cns, cpf, pis, rg, tituloEleitor } from '../../src/core/documents/person.js';
import { isCnpj, isCpf, nums, only } from '../validators.js';

const N = 3000;
const times = (fn) => { for (let i = 0; i < N; i++) fn(); };

test('CPF válido e com máscara', () => times(() => {
  const v = cpf();
  assert.match(v, /^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
  assert.ok(isCpf(v), v);
}));

test('CPF respeita a região fiscal da UF', () => times(() => assert.equal(only(cpf('SP'))[8], '8')));

test('CNPJ numérico válido', () => times(() => {
  const v = cnpj();
  assert.match(v, /^\d{2}\.\d{3}\.\d{3}\/0001-\d{2}$/);
  assert.ok(isCnpj(v), v);
}));

test('CNPJ alfanumérico válido e com ao menos uma letra', () => times(() => {
  const v = cnpjAlfanumerico();
  assert.match(v, /^[0-9A-Z]{2}\.[0-9A-Z]{3}\.[0-9A-Z]{3}\/[0-9A-Z]{4}-\d{2}$/);
  assert.match(only(v).slice(0, 12), /[A-Z]/);
  assert.ok(isCnpj(v), v);
}));

test('CNPJ alfanumérico: exemplo oficial da Receita (12ABC34501DE-35)', () => {
  assert.ok(isCnpj('12ABC34501DE35'));
});

test('RG SP', () => times(() => {
  const v = rg();
  const d = nums(v.slice(0, -1));
  const r = 11 - (d.reduce((s, x, i) => s + x * (i + 2), 0) % 11);
  assert.equal(v.slice(-1), r === 10 ? 'X' : r === 11 ? '0' : String(r));
}));

test('CNH', () => times(() => {
  const d = nums(cnh());
  assert.equal(d.length, 11);
  assert.equal(d[9], d.slice(0, 9).reduce((s, x, i) => s + x * (9 - i), 0) % 11);
  assert.equal(d[10], d.slice(0, 9).reduce((s, x, i) => s + x * (i + 1), 0) % 11);
}));

test('PIS/PASEP', () => times(() => {
  const d = nums(pis());
  const r = 11 - (d.slice(0, 10).reduce((s, x, i) => s + x * [3, 2, 9, 8, 7, 6, 5, 4, 3, 2][i], 0) % 11);
  assert.equal(d[10], r >= 10 ? 0 : r);
}));

test('CNS: soma ponderada múltipla de 11', () => times(() => {
  const d = nums(cns());
  assert.equal(d.length, 15);
  assert.ok([1, 2].includes(d[0]));
  assert.equal(d.reduce((s, x, i) => s + x * (15 - i), 0) % 11, 0);
}));

test('Título de eleitor', () => times(() => {
  const d = nums(tituloEleitor());
  const uf = d[8] * 10 + d[9];
  assert.ok(uf >= 1 && uf <= 27);
  const fix = (r) => (r === 10 ? 0 : r === 0 && uf <= 2 ? 1 : r);
  const dv1 = fix(d.slice(0, 8).reduce((s, x, i) => s + x * (i + 2), 0) % 11);
  assert.deepEqual([d[10], d[11]], [dv1, fix((d[8] * 7 + d[9] * 8 + dv1 * 9) % 11)]);
}));

test('Título usa o código da UF pedida', () => {
  assert.equal(only(tituloEleitor('MG')).slice(8, 10), '02');
  assert.equal(only(tituloEleitor('TO')).slice(8, 10), '27');
});

test('Inscrição Estadual: uma estratégia por UF, para as 27', () => {
  assert.equal(SUPPORTED_UFS.length, 27);
  for (const uf of SUPPORTED_UFS) assert.ok(only(inscricaoEstadual(uf)).length >= 8, uf);
});

test('IE-SP (cálculo de referência do SINTEGRA)', () => times(() => {
  const d = nums(inscricaoEstadual('SP'));
  const dv1 = (d.slice(0, 8).reduce((s, x, i) => s + x * [1, 3, 4, 5, 6, 7, 8, 10][i], 0) % 11) % 10;
  const dv2 = (d.slice(0, 11).reduce((s, x, i) => s + x * [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2][i], 0) % 11) % 10;
  assert.deepEqual([d[8], d[11]], [dv1, dv2]);
}));

test('IE-AM sorteia o primeiro dígito a cada chamada', () => {
  const firsts = new Set(Array.from({ length: 300 }, () => only(inscricaoEstadual('AM'))[0]));
  assert.ok(firsts.size > 5, `apenas ${[...firsts]}`);
});
