import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { GROUPS, VALUE_TYPES, generate } from '../../src/core/registry.js';
import { useMathRandom, useSeed } from '../../src/core/random.js';

afterEach(() => useMathRandom());

test('Todo tipo registrado pertence a um grupo conhecido e tem id único', () => {
  const ids = VALUE_TYPES.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const t of VALUE_TYPES) assert.ok(GROUPS.includes(t.group), t.id);
});

test('generate() sem máscara remove pontuação, mas mantém texto livre', () => {
  for (const t of VALUE_TYPES) {
    const v = generate(t.id, { mask: false, uf: 'SP' });
    if (t.text) assert.ok(v.length > 0);
    else assert.match(v, /^[0-9A-Z]+$/, `${t.id}: ${v}`);
  }
});

test('generate() recusa tipo desconhecido', () => {
  assert.throws(() => generate('inexistente'), /Tipo desconhecido/);
});

test('Com a mesma semente, a geração é reproduzível', () => {
  const run = () => { useSeed(42); return VALUE_TYPES.map((t) => generate(t.id, { uf: 'MG' })); };
  assert.deepEqual(run(), run());
});
