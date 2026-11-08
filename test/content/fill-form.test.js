import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { fillForm } from '../../src/content/fill-form.js';
import { AUTOCOMPLETE_KEYS, FIELD_RULES } from '../../src/content/field-rules.js';
import { insertValue } from '../../src/content/insert-value.js';
import { PROFILE_MASKABLE_KEYS, createFormProfile } from '../../src/core/factories.js';
import { unmask } from '../../src/core/text.js';

const FORM = `
  <form>
    <label for="nome">Nome completo</label><input id="nome" name="nome">
    <label>Nome da mãe <input name="nomeMae"></label>
    <input name="cpf" placeholder="CPF">
    <input name="txtRG" placeholder="RG">
    <input name="email" type="email">
    <label for="cel">Celular (WhatsApp)</label><input id="cel" name="telefoneContato" type="tel">
    <span>Data de nascimento</span><input name="dt" type="date">
    <input name="cep" maxlength="8">
    <input name="enderecoLogradouro" placeholder="Rua">
    <input name="enderecoNumero" placeholder="Nº">
    <input name="bairro">
    <input name="cidade">
    <select name="uf"><option value="">--</option><option value="SP">São Paulo</option><option value="RJ">Rio de Janeiro</option></select>
    <select name="sexo"><option value="">--</option><option value="M">Masculino</option><option value="F">Feminino</option></select>
    <input name="cnpj">
    <input name="numeroCartao" autocomplete="cc-number">
    <input name="senha" type="password">
    <input name="oculto" type="hidden">
    <input name="desabilitado" disabled>
    <input name="aceito" type="checkbox">
  </form>`;

/** As funções de content/ rodam na página: expõe um DOM do jsdom como globals do navegador. */
function setup() {
  const { window } = new JSDOM(`<!doctype html><body>${FORM}</body>`, { pretendToBeVisual: true });
  window.HTMLElement.prototype.getClientRects = function () { return [{}]; }; // jsdom não calcula layout
  for (const name of ['document', 'getComputedStyle', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement', 'Event']) {
    globalThis[name] = name === 'getComputedStyle' ? window.getComputedStyle.bind(window) : window[name];
  }
  return window.document;
}

const options = (useMask) => ({ maskableKeys: PROFILE_MASKABLE_KEYS, useMask, rules: FIELD_RULES, autocomplete: AUTOCOMPLETE_KEYS });
const val = (doc, name) => doc.querySelector(`[name="${name}"]`).value;

test('Regras e opções atravessam a serialização do executeScript', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(options(true))), options(true));
});

test('Preenche o formulário com um perfil coerente', () => {
  const doc = setup();
  const profile = createFormProfile('SP');
  const n = fillForm(profile, options(true));

  assert.equal(val(doc, 'nome'), profile.nome);
  assert.equal(val(doc, 'nomeMae'), profile.mae);
  assert.equal(val(doc, 'cpf'), profile.cpf);
  assert.equal(val(doc, 'txtRG'), profile.rg);
  assert.equal(val(doc, 'email'), profile.email);
  assert.equal(val(doc, 'telefoneContato'), profile.celular);
  assert.equal(val(doc, 'dt'), profile.nascimentoIso);
  assert.equal(val(doc, 'cep'), unmask(profile.cep), 'maxlength=8 deve remover a máscara');
  assert.equal(val(doc, 'enderecoLogradouro'), profile.logradouro);
  assert.equal(val(doc, 'enderecoNumero'), profile.numero);
  assert.equal(val(doc, 'bairro'), profile.bairro);
  assert.equal(val(doc, 'cidade'), profile.cidade);
  assert.equal(val(doc, 'uf'), 'SP');
  assert.equal(val(doc, 'sexo'), profile.sexo[0]);
  assert.equal(val(doc, 'cnpj'), profile.cnpj);
  assert.equal(val(doc, 'numeroCartao'), profile.cartaoNumero);
  assert.equal(val(doc, 'senha'), profile.senha);
  assert.equal(val(doc, 'oculto'), '');
  assert.equal(val(doc, 'desabilitado'), '');
  assert.equal(n, 17);
});

test('Sem máscara, documentos vão só com dígitos', () => {
  const doc = setup();
  const profile = createFormProfile('RJ');
  fillForm(profile, options(false));
  assert.match(val(doc, 'cpf'), /^\d{11}$/);
  assert.match(val(doc, 'telefoneContato'), /^\d{11}$/);
  assert.equal(val(doc, 'nome'), profile.nome);
});

test('Dispara input e change (compatível com React/Vue/Angular)', () => {
  const doc = setup();
  const events = [];
  const input = doc.querySelector('[name="cpf"]');
  for (const type of ['input', 'change']) input.addEventListener(type, () => events.push(type));
  fillForm(createFormProfile(), options(true));
  assert.deepEqual(events, ['input', 'change']);
});

test('insertValue converte data BR para campo type=date', () => {
  const doc = setup();
  const input = doc.querySelector('[name="dt"]');
  input.focus();
  assert.ok(insertValue('25/12/1990'));
  assert.equal(input.value, '1990-12-25');
});

test('Campos "cidade" e "contato" não são confundidos com "idade" e "conta"', () => {
  const doc = setup();
  const profile = createFormProfile();
  fillForm(profile, options(true));
  assert.equal(val(doc, 'cidade'), profile.cidade);
  assert.equal(val(doc, 'telefoneContato'), profile.celular);
});
