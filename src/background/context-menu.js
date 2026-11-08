/** Menu de contexto, montado a partir do registro de tipos (core/registry.js). */
import { GROUPS, VALUE_TYPES, generate } from '../core/registry.js';
import { fillPage, insertIntoPage } from '../features/page-actions.js';
import { settingsRepository } from '../platform/storage.js';

const ROOT = 'ap-root';
const FILL = 'ap-fill';
const MASK = 'ap-mask';
const VALUE_PREFIX = 'ap-value:';

export async function buildContextMenu() {
  await browser.menus.removeAll();
  const { mask } = await settingsRepository.get();
  const everywhere = ['editable', 'page'];

  browser.menus.create({ id: ROOT, title: 'Autopreencha', contexts: everywhere });
  browser.menus.create({ id: FILL, parentId: ROOT, title: 'Preencher formulário inteiro', contexts: everywhere });
  browser.menus.create({ id: 'ap-sep-1', parentId: ROOT, type: 'separator', contexts: ['editable'] });

  for (const group of GROUPS) {
    const groupId = `ap-group:${group}`;
    browser.menus.create({ id: groupId, parentId: ROOT, title: group, contexts: ['editable'] });
    for (const type of VALUE_TYPES.filter((t) => t.group === group)) {
      browser.menus.create({ id: VALUE_PREFIX + type.id, parentId: groupId, title: type.label, contexts: ['editable'] });
    }
  }

  browser.menus.create({ id: 'ap-sep-2', parentId: ROOT, type: 'separator', contexts: everywhere });
  browser.menus.create({ id: MASK, parentId: ROOT, type: 'checkbox', title: 'Gerar com máscara', checked: mask, contexts: everywhere });
}

export async function handleMenuClick(info, tab) {
  const id = String(info.menuItemId);
  if (id === MASK) {
    await settingsRepository.save({ mask: info.checked });
    return;
  }
  const settings = await settingsRepository.get();
  if (id === FILL) {
    await fillPage(tab.id, settings);
  } else if (id.startsWith(VALUE_PREFIX)) {
    await insertIntoPage(tab.id, generate(id.slice(VALUE_PREFIX.length), settings), info.frameId || 0);
  }
}

/** Mantém o checkbox do menu igual à preferência quando ela muda pelo popup. */
export function syncMaskCheckbox(mask) {
  browser.menus.update(MASK, { checked: mask }).catch(() => { /* menu ainda não criado */ });
}
