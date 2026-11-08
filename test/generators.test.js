'use strict';

// Validadores independentes dos geradores, para garantir que os DVs gerados são aceitos.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadLib } = require('./helpers');

const F = loadLib();
const N = 3000;
const only = (s) => String(s).replace(/[^0-9A-Za-z]/g, '');
const nums = (s) => only(s).split('').map(Number);

function times(fn) {
  for (let i = 0; i < N; i++) fn();
}

const isCpf = (v) => {
  const d = nums(v);
  if (d.length !== 11 || new Set(d).size === 1) return false;
  for (const len of [9, 10]) {
    let s = 0;
    for (let i = 0; i < len; i++) s += d[i] * (len + 1 - i);
    const r = (s * 10) % 11 % 10;
    if (r !== d[len]) return false;
  }
  return true;
};

const cnpjValid = (chars) => {
  const vals = chars.map((c) => c.charCodeAt(0) - 48);
  const calc = (len) => {
    const w = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const r = vals.slice(0, len).reduce((s, x, i) => s + x * w[i], 0) % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === vals[12] && calc(13) === vals[13];
};

const luhn = (v) => {
  let s = 0;
  [...only(v)].reverse().forEach((c, i) => {
    let d = Number(c);
    if (i % 2) { d *= 2; if (d > 9) d -= 9; }
    s += d;
  });
  return s % 10 === 0;
};

const iso7064 = (v) => {
  let r = 0;
  for (const ch of only(v)) r = (r * 10 + Number(ch)) % 97;
  return r === 1;
};

test('CPF válido e com máscara', () => times(() => {
  const v = F.cpf();
  assert.match(v, /^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
  assert.ok(isCpf(v), v);
}));

test('CPF respeita a região fiscal da UF', () => times(() => {
  assert.equal(only(F.cpf('SP'))[8], '8');
}));

test('CNPJ numérico válido', () => times(() => {
  const v = F.cnpj();
  assert.match(v, /^\d{2}\.\d{3}\.\d{3}\/0001-\d{2}$/);
  assert.ok(cnpjValid([...only(v)]), v);
}));

test('CNPJ alfanumérico válido e contém letra', () => times(() => {
  const v = F.cnpjAlfanumerico();
  assert.match(v, /^[0-9A-Z]{2}\.[0-9A-Z]{3}\.[0-9A-Z]{3}\/[0-9A-Z]{4}-\d{2}$/);
  assert.match(only(v).slice(0, 12), /[A-Z]/);
  assert.ok(cnpjValid([...only(v)]), v);
}));

test('CNPJ alfanumérico: exemplo oficial da Receita (12ABC34501DE-35)', () => {
  assert.ok(cnpjValid([...'12ABC34501DE35']));
});

test('RG SP', () => times(() => {
  const v = F.rg();
  const d = nums(v.slice(0, -1));
  const r = 11 - (d.reduce((s, x, i) => s + x * (i + 2), 0) % 11);
  assert.equal(v.slice(-1), r === 10 ? 'X' : r === 11 ? '0' : String(r));
}));

test('CNH', () => times(() => {
  const d = nums(F.cnh());
  assert.equal(d.length, 11);
  const dv1 = d.slice(0, 9).reduce((s, x, i) => s + x * (9 - i), 0) % 11;
  const dv2 = d.slice(0, 9).reduce((s, x, i) => s + x * (i + 1), 0) % 11;
  assert.deepEqual([d[9], d[10]], [dv1, dv2]);
}));

test('PIS/PASEP', () => times(() => {
  const d = nums(F.pis());
  const r = 11 - (d.slice(0, 10).reduce((s, x, i) => s + x * [3, 2, 9, 8, 7, 6, 5, 4, 3, 2][i], 0) % 11);
  assert.equal(d[10], r >= 10 ? 0 : r);
}));

test('CNS: soma ponderada múltipla de 11', () => times(() => {
  const d = nums(F.cns());
  assert.equal(d.length, 15);
  assert.ok([1, 2].includes(d[0]));
  assert.equal(d.reduce((s, x, i) => s + x * (15 - i), 0) % 11, 0);
}));

test('Título de eleitor', () => times(() => {
  const d = nums(F.tituloEleitor());
  const uf = d[8] * 10 + d[9];
  assert.ok(uf >= 1 && uf <= 27);
  const fix = (r) => (r === 10 ? 0 : r === 0 && uf <= 2 ? 1 : r);
  const dv1 = fix(d.slice(0, 8).reduce((s, x, i) => s + x * (i + 2), 0) % 11);
  const dv2 = fix((d[8] * 7 + d[9] * 8 + dv1 * 9) % 11);
  assert.deepEqual([d[10], d[11]], [dv1, dv2]);
}));

test('Título usa o código da UF pedida', () => {
  assert.equal(only(F.tituloEleitor('MG')).slice(8, 10), '02');
  assert.equal(only(F.tituloEleitor('TO')).slice(8, 10), '27');
});

test('RENAVAM', () => times(() => {
  const d = nums(F.renavam());
  const r = (d.slice(0, 10).reduce((s, x, i) => s + x * [3, 2, 9, 8, 7, 6, 5, 4, 3, 2][i], 0) * 10) % 11;
  assert.equal(d[10], r === 10 ? 0 : r);
}));

test('Placas', () => times(() => {
  const antiga = F.placa();
  assert.match(antiga, /^[A-Z]{3}-\d{4}$/);
  assert.ok(antiga.slice(0, 3) < 'SAW', antiga);
  assert.match(F.placaMercosul(), /^[A-Z]{3}\d[A-Z]\d{2}$/);
}));

test('Chassi tem 17 caracteres sem I, O, Q', () => times(() => {
  assert.match(F.chassi(), /^[A-HJ-NPR-Z0-9]{17}$/);
}));

test('Cartões passam no Luhn e têm o tamanho da bandeira', () => {
  for (const [key, brand] of Object.entries(F.CARD_BRANDS)) {
    times(() => {
      const c = F.cartao(key);
      assert.equal(only(c.numero).length, brand.length, key);
      assert.ok(luhn(c.numero), `${key} ${c.numero}`);
      assert.equal(c.cvv.length, brand.cvv);
      assert.match(c.validade, /^(0[1-9]|1[0-2])\/\d{2}$/);
    });
  }
});

test('Contas: Banco do Brasil', () => times(() => {
  const c = F.contaBancaria('001');
  const dvBB = (str) => {
    const d = nums(str);
    const r = 11 - (d.reduce((s, x, i) => s + x * (d.length + 1 - i), 0) % 11);
    return r === 10 ? 'X' : r === 11 ? '0' : String(r);
  };
  const [ag, agDv] = c.agencia.split('-');
  const [ct, ctDv] = c.conta.split('-');
  assert.equal(agDv, dvBB(ag));
  assert.equal(ctDv, dvBB(ct));
}));

test('Contas: Itaú (módulo 10 sobre agência + conta)', () => times(() => {
  const c = F.contaBancaria('341');
  const [ct, dv] = c.conta.split('-');
  const d = nums(c.agencia + ct);
  let s = 0;
  d.forEach((x, i) => { const p = x * (i % 2 === 0 ? 2 : 1); s += Math.floor(p / 10) + (p % 10); });
  assert.equal(Number(dv), (10 - (s % 10)) % 10);
}));

test('Contas: Bradesco e Caixa têm formato esperado', () => times(() => {
  assert.match(F.contaBancaria('237').conta, /^\d{7}-[\dP]$/);
  assert.match(F.contaBancaria('104').conta, /^(001|013)\.\d{8}-\d$/);
}));

test('CNM (matrícula de imóvel) passa no ISO 7064 MOD 97-10', () => times(() => {
  const v = F.matriculaCnm();
  assert.match(v, /^\d{6}\.2\.\d{7}-\d{2}$/);
  assert.ok(iso7064(v), v);
}));

test('Inscrição Estadual gera para todas as UFs', () => {
  for (const uf of F.UFS) assert.ok(only(F.inscricaoEstadual(uf)).length >= 8, uf);
});

test('IE-SP (cálculo de referência do SINTEGRA)', () => times(() => {
  const d = nums(F.inscricaoEstadual('SP'));
  const dv1 = (d.slice(0, 8).reduce((s, x, i) => s + x * [1, 3, 4, 5, 6, 7, 8, 10][i], 0) % 11) % 10;
  const dv2 = (d.slice(0, 11).reduce((s, x, i) => s + x * [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2][i], 0) % 11) % 10;
  assert.deepEqual([d[8], d[11]], [dv1, dv2]);
}));

test('Endereço respeita a UF e o DDD da cidade', () => times(() => {
  const p = F.pessoa('RS');
  assert.equal(p.endereco.uf, 'RS');
  assert.equal(only(p.titulo).slice(8, 10), '04');
  assert.match(p.celular, /^\((51|54)\) 9\d{4}-\d{4}$/);
}));

test('Idade é coerente com a data de nascimento', () => times(() => {
  const b = F.birthDate(18, 80);
  assert.ok(b.age >= 18 && b.age <= 80, String(b.age));
  assert.match(b.br, /^\d{2}\/\d{2}\/\d{4}$/);
}));

test('generate() sem máscara remove pontuação, mas mantém texto', () => {
  for (const t of F.TYPES) {
    const v = F.generate(t.id, { mask: false, uf: 'SP' });
    if (t.text) assert.ok(v.length > 0);
    else assert.match(v, /^[0-9A-Z]+$/, `${t.id}: ${v}`);
  }
});

test('Nomes não repetem sobrenome em sequência', () => times(() => {
  const p = F.pessoa();
  for (const n of [p.nome, p.mae, p.pai]) {
    const parts = n.split(' ');
    assert.ok(parts.every((w, i) => i === 0 || w !== parts[i - 1]), n);
  }
}));
