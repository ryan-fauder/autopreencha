#!/usr/bin/env node
/*
 * Gera src/data/ceps.js: CEPs reais (com logradouro, bairro e faixa de numeração) para cada cidade de
 * src/data/places.js, consultando a API pública ViaCEP (https://viacep.com.br).
 *
 * Roda só em desenvolvimento (`npm run ceps`). A extensão usa o arquivo gerado e não faz requisições.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('..', import.meta.url);
const OUT = fileURLToPath(new URL('src/data/ceps.js', ROOT));
const PER_CITY = 24;
// Nomes de logradouro comuns em quase toda cidade brasileira; busca até juntar CEPs suficientes.
const STREETS = ['Brasil', 'Sete de Setembro', 'Tiradentes', 'Getúlio Vargas', 'Rio Branco', 'Santos Dumont',
  'Dom Pedro', 'São José', 'Castro Alves', 'Duque de Caxias', 'Marechal Deodoro', 'Floriano Peixoto'];

const { CITIES: cities } = await import(new URL('src/data/places.js', ROOT));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Converte o "complemento" da ViaCEP em faixa de numeração. Retorna null para CEP de um único imóvel.
function numberRange(complemento) {
  const c = (complemento || '').toLowerCase().trim();
  const lado = /lado (par|ímpar)/.exec(c)?.[1];
  const parity = lado === 'par' ? 'par' : lado === 'ímpar' ? 'impar' : '';
  if (!c) return [1, 3000, ''];
  let m = /^de (\d+)\/?\d* a (\d+)/.exec(c);
  if (m) return [Number(m[1]), Number(m[2]), parity];
  m = /^até (\d+)/.exec(c);
  if (m) return [1, Number(m[1]), parity];
  m = /^de (\d+)\/?\d* (?:ao|até o) fim/.exec(c);
  if (m) return [Number(m[1]), Number(m[1]) + 1500, parity];
  return null;
}

async function search(uf, city, street) {
  const url = `https://viacep.com.br/ws/${uf}/${encodeURIComponent(city)}/${encodeURIComponent(street)}/json/`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    await sleep(1500 * (attempt + 1));
  }
  throw new Error(`ViaCEP falhou: ${url}`);
}

const result = {};
for (const { city, uf } of cities) {
  const found = new Map();
  for (const street of STREETS) {
    if (found.size >= PER_CITY * 2) break;
    const list = await search(uf, city, street);
    for (const r of Array.isArray(list) ? list : []) {
      if (r.localidade !== city || r.uf !== uf || !r.logradouro || !r.bairro || r.unidade) continue;
      const range = numberRange(r.complemento);
      if (!range || range[0] > range[1]) continue;
      found.set(r.cep.replace('-', ''), [r.cep.replace('-', ''), r.logradouro, r.bairro, ...range]);
    }
    await sleep(350);
  }
  // Espalha a amostra entre bairros diferentes, em vez de pegar só uma rua.
  const byBairro = new Map();
  for (const rec of found.values()) {
    if (!byBairro.has(rec[2])) byBairro.set(rec[2], []);
    byBairro.get(rec[2]).push(rec);
  }
  const picked = [];
  while (picked.length < PER_CITY && byBairro.size) {
    for (const [bairro, recs] of byBairro) {
      picked.push(recs.shift());
      if (!recs.length) byBairro.delete(bairro);
      if (picked.length >= PER_CITY) break;
    }
  }
  if (picked.length < 8) throw new Error(`Poucos CEPs para ${city}/${uf}: ${picked.length}`);
  result[`${city}|${uf}`] = picked.sort((a, b) => a[0].localeCompare(b[0]));
  console.log(`${uf} ${city}: ${picked.length}`);
}

const header = `/*
 * CEPs reais por cidade: [cep, logradouro, bairro, número mínimo, número máximo, paridade ('par' | 'impar' | '')].
 * Gerado por scripts/build-ceps.mjs a partir da API ViaCEP em ${new Date().toISOString().slice(0, 10)}. Não edite à mão.
 */
`;
const body = `export const CEPS = ${JSON.stringify(result).replace(/\],\[/g, '],\n    [').replace(/\],"/g, '],\n  "')};
`;
writeFileSync(OUT, header + body);
console.log(`\n${Object.values(result).flat().length} CEPs gravados em src/data/ceps.js`);
