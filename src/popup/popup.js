/* global FakeData, FD_FILL */
'use strict';

const $ = (sel) => document.querySelector(sel);
const IS_SIDEBAR = new URLSearchParams(location.search).get('view') === 'sidebar';
// Identifica esta janela, para ignorar as próprias gravações no storage.onChanged.
const VIEW_ID = Math.random().toString(36).slice(2);

document.documentElement.classList.toggle('view-sidebar', IS_SIDEBAR);

const ENTITIES = ['pessoa', 'empresa', 'conta', 'cartao', 'veiculo', 'imovel'];
const settings = { mask: true, uf: '' };
const ui = { tab: 'gerador', bank: '', brand: '' };
// Valores gerados. Ficam salvos para sobreviver ao fechamento do popup.
let data = { quick: {} };

// ---------------------------------------------------------------- persistência

function saveData() {
  browser.storage.local.set({ fdData: { ...data, origin: VIEW_ID } });
}

function saveUi() {
  browser.storage.local.set({ fdUi: ui });
}

// ---------------------------------------------------------------- helpers de DOM

function el(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  for (const c of [].concat(children)) if (c != null) node.append(c);
  return node;
}

function icon(name) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(NS, 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}

function iconButton(name, label, onclick, className = '') {
  return el('button', { type: 'button', className, title: label, ariaLabel: label, onclick }, icon(name));
}

const display = (value, maskable) => (maskable && !settings.mask ? FakeData.unmask(value) : String(value));

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

function flash(node, cls = 'copied') {
  node.classList.add(cls);
  const btn = node.querySelector('.act-copy use');
  if (btn) btn.setAttribute('href', '#i-check');
  setTimeout(() => {
    node.classList.remove(cls);
    if (btn) btn.setAttribute('href', '#i-copy');
  }, 1200);
}

// ---------------------------------------------------------------- copiar / inserir

async function copy(text, row, label) {
  try {
    await navigator.clipboard.writeText(text);
    if (row) flash(row);
    toast(label ? `${label} copiado` : 'Copiado');
  } catch {
    toast('Não foi possível copiar');
  }
}

// Na barra lateral não há activeTab: pede acesso às páginas na primeira vez.
// Deve ser chamado de forma síncrona dentro do clique (exigência do navegador).
function requestPageAccess() {
  if (!IS_SIDEBAR) return Promise.resolve(true);
  return browser.permissions.request({ origins: ['<all_urls>'] });
}

async function activeTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function insert(text, row, label) {
  const access = requestPageAccess();
  try {
    if (!(await access)) { toast('Permissão negada para acessar a página'); return; }
    const tab = await activeTab();
    const run = (target) => browser.scripting.executeScript({ target, func: FD_FILL.insertValue, args: [text] });
    let results;
    try {
      results = await run({ tabId: tab.id, allFrames: true });
    } catch {
      // Sem acesso a algum iframe de outra origem: tenta só o documento principal.
      results = await run({ tabId: tab.id });
    }
    if (results.some((r) => r.result)) {
      if (row) flash(row);
      toast(`${label || 'Valor'} inserido no campo`);
    } else {
      toast('Clique antes em um campo da página');
    }
  } catch {
    toast('Esta página não permite inserir valores');
  }
}

// ---------------------------------------------------------------- linhas

// field: { label, value, maskable?, onRegen? }
function row({ label, value, maskable, onRegen }) {
  const text = display(value, maskable);
  const node = el('div', { className: 'row' });
  node.append(
    el('span', { className: 'label', textContent: label }),
    el('button', {
      type: 'button', className: 'value', textContent: text, title: 'Copiar',
      onclick: () => copy(text, node, label),
    }),
    el('div', { className: 'row-actions' }, [
      iconButton('insert', `Inserir ${label} no campo selecionado`, () => insert(text, node, label)),
      iconButton('copy', `Copiar ${label}`, () => copy(text, node, label), 'act-copy'),
      onRegen ? iconButton('refresh', `Gerar outro ${label}`, onRegen) : null,
    ]),
  );
  return node;
}

// Lista de campos: [rótulo, valor, mascarável?]
function renderFields(container, fields) {
  const rows = fields
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([label, value, maskable]) => row({ label, value, maskable }));
  container.replaceChildren(el('div', { className: 'list' }, rows));
}

// ---------------------------------------------------------------- aba Gerador

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function quickValue(t) {
  if (!data.quick[t.id]) data.quick[t.id] = FakeData.generate(t.id, { mask: true, uf: settings.uf });
  return data.quick[t.id];
}

function renderQuick() {
  const q = norm($('#filter').value.trim());
  const box = $('#quick');
  const out = [];
  let group = null;
  let list = null;
  for (const t of FakeData.TYPES) {
    if (q && !norm(`${t.label} ${t.group} ${t.id}`).includes(q)) continue;
    if (t.group !== group) {
      group = t.group;
      list = el('div', { className: 'list' });
      out.push(el('h3', { textContent: group }), list);
    }
    list.append(row({
      label: t.label,
      value: quickValue(t),
      maskable: !t.text,
      onRegen: () => { delete data.quick[t.id]; renderQuick(); saveData(); },
    }));
  }
  box.replaceChildren(...(out.length ? out : [el('p', { className: 'empty', textContent: 'Nenhum tipo encontrado.' })]));
}

// ---------------------------------------------------------------- abas de entidades

function addressFields(e) {
  return [
    ['CEP', e.cep, true], ['Logradouro', e.logradouro], ['Número', e.numero], ['Complemento', e.complemento],
    ['Bairro', e.bairro], ['Cidade', e.cidade], ['Estado', `${e.estado} (${e.uf})`], ['Endereço completo', e.completo],
  ];
}

const generators = {
  pessoa: () => FakeData.pessoa(settings.uf),
  empresa: () => FakeData.empresa(settings.uf),
  conta: () => FakeData.contaBancaria(ui.bank),
  cartao: () => FakeData.cartao(ui.brand, data.pessoa && data.pessoa.nome),
  veiculo: () => FakeData.veiculo(settings.uf),
  imovel: () => FakeData.imovel(settings.uf),
};

function get(entity) {
  if (!data[entity]) data[entity] = generators[entity]();
  return data[entity];
}

function renderPessoa() {
  const p = get('pessoa');
  renderFields($('#pessoa'), [
    ['Nome', p.nome], ['Sexo', p.sexo], ['Nascimento', p.nascimento, true], ['Idade', `${p.idade} anos`],
    ['Mãe', p.mae], ['Pai', p.pai],
    ['CPF', p.cpf, true], ['RG', p.rg, true], ['Órgão emissor', p.orgaoEmissor],
    ['CNH', p.cnh], ['Categoria CNH', p.categoriaCnh], ['PIS/PASEP', p.pis, true], ['CNS', p.cns, true],
    ['Título de eleitor', p.titulo, true], ['Passaporte', p.passaporte],
    ['E-mail', p.email], ['Celular', p.celular, true], ['Telefone', p.telefone, true],
    ['Usuário', p.usuario], ['Senha', p.senha],
    ['Estado civil', p.estadoCivil], ['Profissão', p.profissao],
    ['Cor/Raça', p.racaCor], ['Orientação sexual', p.orientacaoSexual], ['Identidade de gênero', p.identidadeGenero],
    ['Tipo sanguíneo', p.tipoSanguineo], ['Altura', p.altura], ['Peso', p.peso],
    ...addressFields(p.endereco),
  ]);
}

function renderEmpresa() {
  const e = get('empresa');
  renderFields($('#empresa'), [
    ['Razão social', e.razaoSocial], ['Nome fantasia', e.nomeFantasia],
    ['CNPJ', e.cnpj, true], ['CNPJ alfanumérico', e.cnpjAlfanumerico, true],
    ['Inscrição estadual', e.inscricaoEstadual, true], ['Inscrição municipal', e.inscricaoMunicipal],
    ['Data de abertura', e.dataAbertura, true], ['E-mail', e.email], ['Site', e.site],
    ['Telefone', e.telefone, true], ['Celular', e.celular, true],
    ...addressFields(e.endereco),
  ]);
}

function renderConta() {
  const c = get('conta');
  renderFields($('#conta'), [
    ['Banco', c.banco], ['Código', c.codigo], ['Agência', c.agencia, true], ['Conta', c.conta, true], ['Tipo', c.tipo],
  ]);
  $('#conta').append(el('p', {
    className: 'note',
    textContent: c.oficial ? 'DV calculado pelo algoritmo oficial do banco.'
      : 'Este banco não publica o algoritmo do DV; foi usado módulo 11 genérico.',
  }));
}

function renderCartao() {
  const c = get('cartao');
  renderFields($('#cartao'), [
    ['Bandeira', c.bandeira], ['Número', c.numero, true], ['Nome impresso', c.nome],
    ['Validade', c.validade, true], ['CVV', c.cvv],
  ]);
}

function renderVeiculo() {
  const v = get('veiculo');
  renderFields($('#veiculo'), [
    ['Marca', v.marca], ['Modelo', v.modelo], ['Ano fab./modelo', `${v.anoFabricacao}/${v.anoModelo}`],
    ['Cor', v.cor], ['Combustível', v.combustivel], ['Placa Mercosul', v.placaMercosul],
    ['Placa antiga', v.placa, true], ['RENAVAM', v.renavam], ['Chassi', v.chassi], ['UF', v.uf],
  ]);
}

function renderImovel() {
  const i = get('imovel');
  renderFields($('#imovel'), [
    ['Tipo', i.tipo], ['Finalidade', i.finalidade], ['Área total', i.areaTotal], ['Área útil', i.areaUtil],
    ['Quartos', i.quartos], ['Suítes', i.suites], ['Banheiros', i.banheiros], ['Vagas', i.vagas],
    ['Ano de construção', i.anoConstrucao], ['Valor de venda', i.valorVenda], ['Aluguel', i.valorAluguel],
    ['Condomínio', i.condominio], ['IPTU anual', i.iptuAnual], ['Inscrição IPTU', i.inscricaoIptu, true],
    ['Cartório', i.cartorio], ['CNS do cartório', i.cnsCartorio], ['Matrícula', i.matricula],
    ['CNM', i.cnm, true], ['Proprietário', i.proprietario], ['CPF proprietário', i.cpfProprietario, true],
    ...addressFields(i.endereco),
  ]);
}

function renderBancos() {
  const q = norm($('#bank-search').value.trim());
  const items = FakeData.BANKS
    .filter((b) => !q || b.code.includes(q) || norm(b.name).includes(q))
    .map((b) => {
      const li = el('li');
      li.append(el('button', { type: 'button', title: 'Copiar código', onclick: () => copy(b.code, li, `Código ${b.code}`) }, [
        el('span', { className: 'code', textContent: b.code }),
        el('span', { textContent: b.name }),
      ]));
      return li;
    });
  $('#bank-list').replaceChildren(...(items.length ? items : [el('li', { className: 'empty', textContent: 'Nenhum banco encontrado.' })]));
}

const renderers = {
  gerador: renderQuick, pessoa: renderPessoa, empresa: renderEmpresa,
  financeiro: () => { renderConta(); renderCartao(); }, veiculo: renderVeiculo, imovel: renderImovel, bancos: renderBancos,
};

// Renderiza tudo e grava o que tiver sido gerado pela primeira vez.
function renderAll() {
  const before = JSON.stringify(data);
  Object.values(renderers).forEach((r) => r());
  if (JSON.stringify(data) !== before) saveData();
}

// ---------------------------------------------------------------- abas

const tabButtons = () => [...document.querySelectorAll('.tabs [role="tab"]')];

function selectTab(name, focus = false) {
  for (const t of tabButtons()) {
    const on = t.dataset.tab === name;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    t.setAttribute('aria-controls', `tab-${t.dataset.tab}`);
    if (on && focus) t.focus();
  }
  for (const p of document.querySelectorAll('.panel')) p.hidden = p.id !== `tab-${name}`;
  $('#main').scrollTop = 0;
  ui.tab = name;
}

$('.tabs').addEventListener('click', (ev) => {
  const t = ev.target.closest('[role="tab"]');
  if (!t) return;
  selectTab(t.dataset.tab);
  saveUi();
});

// Setas/Home/End navegam entre as abas (padrão WAI-ARIA).
$('.tabs').addEventListener('keydown', (ev) => {
  const tabs = tabButtons();
  const i = tabs.findIndex((t) => t.dataset.tab === ui.tab);
  const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[ev.key];
  if (next === undefined) return;
  ev.preventDefault();
  selectTab(tabs[(next + tabs.length) % tabs.length].dataset.tab, true);
  saveUi();
});

// ---------------------------------------------------------------- ações

const regen = (entity, render) => () => { data[entity] = null; render(); saveData(); };
const copyJson = (entity) => () => copy(JSON.stringify(data[entity], null, 2), null, 'JSON');

const actions = {
  'regen-quick': () => { data.quick = {}; renderQuick(); saveData(); },
  'new-pessoa': regen('pessoa', renderPessoa),
  'new-empresa': regen('empresa', renderEmpresa),
  'new-conta': regen('conta', renderConta),
  'new-cartao': regen('cartao', renderCartao),
  'new-veiculo': regen('veiculo', renderVeiculo),
  'new-imovel': regen('imovel', renderImovel),
  'json-pessoa': copyJson('pessoa'),
  'json-empresa': copyJson('empresa'),
  'json-veiculo': copyJson('veiculo'),
  'json-imovel': copyJson('imovel'),
};

document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-action]');
  if (btn) actions[btn.dataset.action]();
});

$('#fill').addEventListener('click', async () => {
  const access = requestPageAccess();
  try {
    if (!(await access)) { toast('Permissão negada para acessar a página'); return; }
    const tab = await activeTab();
    const n = await browser.runtime.sendMessage({ type: 'fill-form', tabId: tab.id });
    toast(n ? `${n} campo(s) autopreenchido(s)` : 'Nenhum campo reconhecido nesta página');
  } catch {
    toast('Esta página não permite preenchimento');
  }
});

$('#pin').addEventListener('click', () => {
  if (IS_SIDEBAR) {
    browser.sidebarAction.close();
    return;
  }
  // open() precisa ser chamado diretamente no clique.
  browser.sidebarAction.open().then(() => window.close(), () => toast('Não foi possível abrir a barra lateral'));
});

$('#mask').addEventListener('change', (e) => {
  settings.mask = e.target.checked;
  browser.storage.local.set({ mask: settings.mask });
  renderAll();
});

$('#uf').addEventListener('change', (e) => {
  settings.uf = e.target.value;
  data = { quick: {} };
  browser.storage.local.set({ uf: settings.uf });
  renderAll();
});

$('#bank').addEventListener('change', (e) => { ui.bank = e.target.value; saveUi(); actions['new-conta'](); });
$('#brand').addEventListener('change', (e) => { ui.brand = e.target.value; saveUi(); actions['new-cartao'](); });
$('#filter').addEventListener('input', renderQuick);
$('#bank-search').addEventListener('input', renderBancos);

// Mantém popup e barra lateral sincronizados.
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  let dirty = false;
  if (changes.fdData && changes.fdData.newValue && changes.fdData.newValue.origin !== VIEW_ID) {
    data = { quick: {}, ...changes.fdData.newValue };
    dirty = true;
  }
  if (changes.mask && changes.mask.newValue !== settings.mask) {
    settings.mask = changes.mask.newValue;
    $('#mask').checked = settings.mask;
    dirty = true;
  }
  if (changes.uf && changes.uf.newValue !== settings.uf) {
    settings.uf = changes.uf.newValue;
    $('#uf').value = settings.uf;
  }
  if (dirty) Object.values(renderers).forEach((r) => r());
});

// ---------------------------------------------------------------- init

(async function init() {
  if (IS_SIDEBAR) {
    $('#pin').setAttribute('aria-pressed', 'true');
    $('#pin').title = 'Fechar a barra lateral';
    $('#pin').ariaLabel = 'Fechar a barra lateral';
    $('#pin use').setAttribute('href', '#i-unpin');
    $('#pin .pin-label').textContent = 'Fechar';
  }

  for (const uf of FakeData.UFS.slice().sort()) {
    $('#uf').append(el('option', { value: uf, textContent: `${uf} – ${FakeData.STATES[uf]}` }));
  }
  for (const b of FakeData.BANKS) $('#bank').append(el('option', { value: b.code, textContent: `${b.code} – ${b.name}` }));
  for (const [key, b] of Object.entries(FakeData.CARD_BRANDS)) $('#brand').append(el('option', { value: key, textContent: b.label }));

  const saved = await browser.storage.local.get({ mask: true, uf: '', fdData: null, fdUi: null });
  settings.mask = saved.mask;
  settings.uf = saved.uf;
  if (saved.fdData) data = { quick: {}, ...saved.fdData };
  if (saved.fdUi) Object.assign(ui, saved.fdUi);
  for (const k of ENTITIES) if (data[k] === undefined) data[k] = null;

  $('#mask').checked = settings.mask;
  $('#uf').value = settings.uf;
  $('#bank').value = ui.bank;
  $('#brand').value = ui.brand;

  selectTab(ui.tab);
  renderAll();
})();
