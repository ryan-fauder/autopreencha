/**
 * Renderização: transforma o estado em DOM. Não lê nem grava estado e não fala com o navegador;
 * as ações chegam por `handlers` ({ copy, insert, regenerate }).
 */
import { BANKS } from '../../data/banks.js';
import { GROUPS, VALUE_TYPES } from '../../core/registry.js';
import { unmask } from '../../core/text.js';
import { $, el, iconButton } from '../dom.js';
import { ENTITY_FIELDS } from './fields.js';

const normalize = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

function valueRow({ label, value, maskable, mask, onRegen }, handlers) {
  const text = maskable && !mask ? unmask(value) : String(value);
  const row = el('div', { className: 'row' });
  row.append(
    el('span', { className: 'label', textContent: label }),
    el('button', { type: 'button', className: 'value', textContent: text, title: 'Copiar', onclick: () => handlers.copy(text, row, label) }),
    el('div', { className: 'row-actions' }, [
      iconButton('insert', `Inserir ${label} no campo selecionado`, () => handlers.insert(text, row, label)),
      iconButton('copy', `Copiar ${label}`, () => handlers.copy(text, row, label), 'act-copy'),
      onRegen ? iconButton('refresh', `Gerar outro ${label}`, onRegen) : null,
    ]),
  );
  return row;
}

function renderQuick(state, handlers) {
  const query = normalize(state.ui.filter || '');
  const sections = GROUPS.map((group) => {
    const rows = VALUE_TYPES
      .filter((t) => t.group === group && (!query || normalize(`${t.label} ${t.group} ${t.id}`).includes(query)))
      .map((t) => valueRow({
        label: t.label, value: state.data.quick[t.id], maskable: !t.text, mask: state.settings.mask,
        onRegen: () => handlers.regenerate(`quick:${t.id}`),
      }, handlers));
    return rows.length ? [el('h3', { textContent: group }), el('div', { className: 'list' }, rows)] : [];
  }).flat();
  $('#quick').replaceChildren(...(sections.length ? sections
    : [el('p', { className: 'empty', textContent: 'Nenhum tipo encontrado.' })]));
}

function renderEntity(entity, containerId, state, handlers) {
  const rows = ENTITY_FIELDS[entity](state.data[entity])
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value, maskable]) => valueRow({ label, value, maskable, mask: state.settings.mask }, handlers));
  $(containerId).replaceChildren(el('div', { className: 'list' }, rows));
}

function renderBanks(state, handlers) {
  const query = normalize(state.ui.bankQuery || '');
  const items = BANKS
    .filter((b) => !query || b.code.includes(query) || normalize(b.name).includes(query))
    .map((b) => {
      const li = el('li');
      li.append(el('button', { type: 'button', title: 'Copiar código', onclick: () => handlers.copy(b.code, li, `Código ${b.code}`) }, [
        el('span', { className: 'code', textContent: b.code }),
        el('span', { textContent: b.name }),
      ]));
      return li;
    });
  $('#bank-list').replaceChildren(...(items.length ? items : [el('li', { className: 'empty', textContent: 'Nenhum banco encontrado.' })]));
}

export function render(state, handlers) {
  renderQuick(state, handlers);
  renderEntity('pessoa', '#pessoa', state, handlers);
  renderEntity('empresa', '#empresa', state, handlers);
  renderEntity('conta', '#conta', state, handlers);
  $('#conta').append(el('p', {
    className: 'note',
    textContent: state.data.conta.oficial ? 'DV calculado pelo algoritmo oficial do banco.'
      : 'Este banco não publica o algoritmo do DV; foi usado módulo 11 genérico.',
  }));
  renderEntity('cartao', '#cartao', state, handlers);
  renderEntity('veiculo', '#veiculo', state, handlers);
  renderEntity('imovel', '#imovel', state, handlers);
  renderBanks(state, handlers);
}
