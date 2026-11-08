import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CEPS } from '../../src/data/ceps.js';
import { CITIES } from '../../src/data/places.js';
import { createPessoa } from '../../src/core/factories.js';
import { address, cep } from '../../src/core/geo.js';
import { birthDate } from '../../src/core/people.js';
import { only } from '../validators.js';

const N = 3000;
const times = (fn) => { for (let i = 0; i < N; i++) fn(); };
const ALL_CEPS = new Map(Object.entries(CEPS).flatMap(([city, list]) => list.map((r) => [r[0], { city, record: r }])));

test('Toda cidade tem CEPs reais na base, com 8 dígitos', () => {
  for (const { city, uf } of CITIES) {
    const list = CEPS[`${city}|${uf}`];
    assert.ok(list && list.length >= 8, `${city}/${uf}`);
    for (const [code] of list) assert.match(code, /^\d{8}$/);
  }
});

test('CEP gerado é sempre um CEP real da base', () => times(() => {
  assert.ok(ALL_CEPS.has(only(cep())));
  assert.ok(ALL_CEPS.has(only(cep('BA'))));
}));

test('Endereço: CEP, logradouro, bairro e cidade vêm do mesmo registro real', () => times(() => {
  const a = address();
  const found = ALL_CEPS.get(only(a.cep));
  assert.ok(found, a.cep);
  const [, logradouro, bairro, min, max, parity] = found.record;
  assert.equal(found.city, `${a.cidade}|${a.uf}`);
  assert.equal(a.logradouro, logradouro);
  assert.equal(a.bairro, bairro);
  const n = Number(a.numero);
  assert.ok(n >= min && n <= max, `${a.numero} fora de ${min}–${max} (${a.cep})`);
  if (parity === 'par') assert.equal(n % 2, 0, a.cep);
  if (parity === 'impar') assert.equal(n % 2, 1, a.cep);
}));

test('Pessoa coerente com a UF: endereço, título e DDD', () => times(() => {
  const p = createPessoa('RS');
  assert.equal(p.endereco.uf, 'RS');
  assert.equal(only(p.titulo).slice(8, 10), '04');
  assert.match(p.celular, /^\((51|54)\) 9\d{4}-\d{4}$/);
}));

test('Nomes não repetem sobrenome em sequência', () => times(() => {
  const p = createPessoa();
  for (const n of [p.nome, p.mae, p.pai]) {
    const parts = n.split(' ');
    assert.ok(parts.every((w, i) => i === 0 || w !== parts[i - 1]), n);
  }
}));

test('Idade sempre dentro da faixa pedida', () => times(() => {
  const b = birthDate(18, 80);
  assert.ok(b.age >= 18 && b.age <= 80, String(b.age));
  assert.match(b.br, /^\d{2}\/\d{2}\/\d{4}$/);
}));
