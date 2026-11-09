/**
 * Raiz de composição do popup e da barra lateral (a mesma página, com ?view=sidebar).
 * Só conecta as peças: repositórios → estado → renderização, e eventos da interface → comandos.
 */
import '../platform/compat.js';
import { CARD_BRANDS } from '../core/finance.js';
import { BANKS } from '../data/banks.js';
import { STATES, UFS } from '../data/places.js';
import { sessionRepository, settingsRepository } from '../platform/storage.js';
import { createCommands } from './commands.js';
import { $, el } from './dom.js';
import { flash, toast } from './feedback.js';
import { emptyData, ensureGenerated } from './generation.js';
import { createStore } from './store.js';
import { createTabs } from './tabs.js';
import { render } from './views/render.js';

const IS_SIDEBAR = new URLSearchParams(location.search).get('view') === 'sidebar';
// Identifica esta janela, para ignorar o eco das próprias gravações no storage.
const VIEW_ID = crypto.randomUUID();
const DEFAULT_UI = { tab: 'gerador', bank: '', brand: '', filter: '', bankQuery: '' };
const PERSISTED_UI_KEYS = ['tab', 'bank', 'brand'];

document.documentElement.classList.toggle('view-sidebar', IS_SIDEBAR);

const store = createStore({ settings: { mask: true, uf: '' }, ui: DEFAULT_UI, data: emptyData() });
const commands = createCommands({ isSidebar: IS_SIDEBAR });
const tabs = createTabs($('.tabs'), { onSelect: (tab) => updateUi({ tab }) });
let applyingExternalData = false;

/** Toda mudança de estado passa por aqui: aplica o patch e gera o que estiver faltando. */
function update(patch) {
  const next = { ...store.getState(), ...patch };
  store.setState({ ...patch, data: ensureGenerated(next) });
}
const updateUi = (patch) => update({ ui: { ...store.getState().ui, ...patch } });
const discard = (...keys) => update({ data: { ...store.getState().data, ...Object.fromEntries(keys.map((k) => [k, null])) } });

// ---------------------------------------------------------------- ações vindas das linhas

const handlers = {
  async copy(text, row, label) {
    try {
      await commands.copy(text);
      flash(row);
      toast(label ? `${label} copiado.` : 'Copiado.');
    } catch {
      toast('Não foi possível copiar');
    }
  },

  async insert(text, row, label) {
    try {
      const result = await commands.insert(text);
      if (result === 'ok') {
        flash(row);
        toast(`${label} inserido no campo.`);
      } else {
        toast(result === 'denied' ? 'Permissão negada para acessar a página' : 'Clique antes em um campo da página');
      }
    } catch {
      toast('Esta página não permite inserir valores');
    }
  },

  /** 'quick' (todos do Gerador), 'quick:<id>' (um valor) ou o nome de uma entidade. */
  regenerate(target) {
    const { data } = store.getState();
    if (target === 'quick') return update({ data: { ...data, quick: {} } });
    if (target.startsWith('quick:')) {
      const quick = { ...data.quick };
      delete quick[target.slice('quick:'.length)];
      return update({ data: { ...data, quick } });
    }
    return discard(target);
  },
};

// ---------------------------------------------------------------- reação às mudanças de estado

store.subscribe((state, previous) => {
  render(state, handlers);
  tabs.select(state.ui.tab);
  if (state.ui.tab !== previous.ui.tab) $('#main').scrollTop = 0;

  if (state.data !== previous.data && !applyingExternalData) sessionRepository.saveData(state.data, VIEW_ID);
  if (PERSISTED_UI_KEYS.some((k) => state.ui[k] !== previous.ui[k])) {
    sessionRepository.saveUi(Object.fromEntries(PERSISTED_UI_KEYS.map((k) => [k, state.ui[k]])));
  }
});

// Mantém popup e barra lateral iguais quando a outra janela muda algo.
sessionRepository.onDataChange((data, origin) => {
  if (origin === VIEW_ID) return;
  applyingExternalData = true;
  update({ data: { ...emptyData(), ...data } });
  applyingExternalData = false;
});

settingsRepository.onChange((patch) => {
  const settings = { ...store.getState().settings, ...patch };
  $('#mask').checked = settings.mask;
  $('#uf').value = settings.uf;
  update({ settings });
});

// ---------------------------------------------------------------- eventos da interface

const ACTIONS = {
  'regen-quick': () => handlers.regenerate('quick'),
  'new-pessoa': () => discard('pessoa'),
  'new-empresa': () => discard('empresa'),
  'new-conta': () => discard('conta'),
  'new-cartao': () => discard('cartao'),
  'new-veiculo': () => discard('veiculo'),
  'new-imovel': () => discard('imovel'),
  'json-pessoa': () => handlers.copy(JSON.stringify(store.getState().data.pessoa, null, 2), null, 'JSON'),
  'json-empresa': () => handlers.copy(JSON.stringify(store.getState().data.empresa, null, 2), null, 'JSON'),
  'json-veiculo': () => handlers.copy(JSON.stringify(store.getState().data.veiculo, null, 2), null, 'JSON'),
  'json-imovel': () => handlers.copy(JSON.stringify(store.getState().data.imovel, null, 2), null, 'JSON'),
};

document.addEventListener('click', (ev) => {
  const button = ev.target.closest('[data-action]');
  if (button) ACTIONS[button.dataset.action]?.();
});

$('#fill').addEventListener('click', async () => {
  try {
    const result = await commands.fill(store.getState().settings);
    if (result === 'denied') toast('Permissão negada para acessar a página');
    else if (result) toast(`${result} ${result === 1 ? 'campo preenchido' : 'campos preenchidos'}. Nenhuma pessoa real foi incomodada.`);
    else toast('Nenhum campo encontrado. Talvez seja só texto.');
  } catch {
    toast('Esta página não permite preenchimento');
  }
});

$('#pin').addEventListener('click', () => {
  commands.togglePin().catch(() => toast('Não foi possível abrir a barra lateral'));
});

$('#mask').addEventListener('change', (ev) => {
  const settings = { ...store.getState().settings, mask: ev.target.checked };
  settingsRepository.save({ mask: settings.mask });
  update({ settings });
});

$('#uf').addEventListener('change', (ev) => {
  const settings = { ...store.getState().settings, uf: ev.target.value };
  settingsRepository.save({ uf: settings.uf });
  // Tudo que depende da UF é descartado e gerado de novo.
  update({ settings, data: emptyData() });
});

$('#bank').addEventListener('change', (ev) => update({
  ui: { ...store.getState().ui, bank: ev.target.value },
  data: { ...store.getState().data, conta: null },
}));

$('#brand').addEventListener('change', (ev) => update({
  ui: { ...store.getState().ui, brand: ev.target.value },
  data: { ...store.getState().data, cartao: null },
}));

$('#filter').addEventListener('input', (ev) => updateUi({ filter: ev.target.value }));
$('#bank-search').addEventListener('input', (ev) => updateUi({ bankQuery: ev.target.value }));

// ---------------------------------------------------------------- inicialização

function fillSelect(select, options) {
  for (const [value, label] of options) select.append(el('option', { value, textContent: label }));
}

function setupSidebarMode() {
  const pin = $('#pin');
  pin.setAttribute('aria-pressed', 'true');
  pin.title = 'Fechar a barra lateral';
  pin.ariaLabel = 'Fechar a barra lateral';
  pin.querySelector('use').setAttribute('href', '#i-unpin');
  pin.querySelector('.pin-label').textContent = 'Fechar';
}

async function init() {
  if (IS_SIDEBAR) setupSidebarMode();
  fillSelect($('#uf'), [...UFS].sort().map((uf) => [uf, `${uf} – ${STATES[uf]}`]));
  fillSelect($('#bank'), BANKS.map((b) => [b.code, `${b.code} – ${b.name}`]));
  fillSelect($('#brand'), Object.entries(CARD_BRANDS).map(([key, b]) => [key, b.label]));

  const [settings, session] = await Promise.all([settingsRepository.get(), sessionRepository.load()]);
  const ui = { ...DEFAULT_UI, ...session.ui };
  $('#mask').checked = settings.mask;
  $('#uf').value = settings.uf;
  $('#bank').value = ui.bank;
  $('#brand').value = ui.brand;

  update({ settings, ui, data: { ...emptyData(), ...session.data } });
}

init();
