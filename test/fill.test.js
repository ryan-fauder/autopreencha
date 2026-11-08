'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { loadLib } = require('./helpers');

const F = loadLib();

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

function setup() {
  const dom = new JSDOM(`<!doctype html><body>${FORM}</body>`, { pretendToBeVisual: true });
  const { window } = dom;
  // jsdom não calcula layout; considera todo elemento renderizado.
  window.HTMLElement.prototype.getClientRects = function () { return [{}]; };
  const FILL = loadLib({
    window, document: window.document, getComputedStyle: window.getComputedStyle.bind(window),
    HTMLInputElement: window.HTMLInputElement, HTMLTextAreaElement: window.HTMLTextAreaElement,
    HTMLSelectElement: window.HTMLSelectElement, Event: window.Event,
  }).FILL;
  return { window, doc: window.document, FILL };
}

const val = (doc, name) => doc.querySelector(`[name="${name}"]`).value;

test('preenche o formulário com um perfil coerente', () => {
  const { doc, FILL } = setup();
  const profile = F.profile('SP');
  const n = FILL.fillForm(profile, F.MASKABLE, true);

  assert.equal(val(doc, 'nome'), profile.nome);
  assert.equal(val(doc, 'nomeMae'), profile.mae);
  assert.equal(val(doc, 'cpf'), profile.cpf);
  assert.equal(val(doc, 'txtRG'), profile.rg);
  assert.equal(val(doc, 'email'), profile.email);
  assert.equal(val(doc, 'telefoneContato'), profile.celular);
  assert.equal(val(doc, 'dt'), profile.nascimentoIso);
  assert.equal(val(doc, 'cep'), F.unmask(profile.cep), 'maxlength=8 deve remover a máscara');
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

test('sem máscara, documentos vão só com dígitos', () => {
  const { doc, FILL } = setup();
  const profile = F.profile('RJ');
  FILL.fillForm(profile, F.MASKABLE, false);
  assert.match(val(doc, 'cpf'), /^\d{11}$/);
  assert.match(val(doc, 'telefoneContato'), /^\d{11}$/);
  assert.equal(val(doc, 'nome'), profile.nome);
});

test('dispara eventos input e change (compatível com React/Vue/Angular)', () => {
  const { doc, FILL, window } = setup();
  const events = [];
  const input = doc.querySelector('[name="cpf"]');
  for (const type of ['input', 'change']) input.addEventListener(type, () => events.push(type));
  FILL.fillForm(F.profile(), F.MASKABLE, true);
  assert.deepEqual(events, ['input', 'change']);
  assert.ok(window);
});

test('insertValue converte data BR para campo type=date', () => {
  const { doc, FILL } = setup();
  const input = doc.querySelector('[name="dt"]');
  input.focus();
  assert.ok(FILL.insertValue('25/12/1990'));
  assert.equal(input.value, '1990-12-25');
});
