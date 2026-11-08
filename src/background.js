/* global FakeData, FD_FILL */
'use strict';

const DEFAULTS = { mask: true, uf: '' };
const GROUP_ORDER = ['Pessoa', 'Empresa', 'Contato', 'Veículo', 'Financeiro', 'Imóvel'];

const getSettings = () => browser.storage.local.get(DEFAULTS);

async function buildMenus() {
  await browser.menus.removeAll();
  const { mask } = await getSettings();

  browser.menus.create({ id: 'fd-root', title: 'Dados fictícios', contexts: ['editable', 'page'] });
  browser.menus.create({ id: 'fd-fill', parentId: 'fd-root', title: 'Preencher formulário inteiro', contexts: ['editable', 'page'] });
  browser.menus.create({ id: 'fd-sep1', parentId: 'fd-root', type: 'separator', contexts: ['editable'] });

  for (const group of GROUP_ORDER) {
    const groupId = `fd-group-${group}`;
    browser.menus.create({ id: groupId, parentId: 'fd-root', title: group, contexts: ['editable'] });
    for (const t of FakeData.TYPES.filter((x) => x.group === group)) {
      browser.menus.create({ id: `fd-gen-${t.id}`, parentId: groupId, title: t.label, contexts: ['editable'] });
    }
  }

  browser.menus.create({ id: 'fd-sep2', parentId: 'fd-root', type: 'separator', contexts: ['editable', 'page'] });
  browser.menus.create({
    id: 'fd-mask', parentId: 'fd-root', type: 'checkbox', title: 'Gerar com máscara', checked: mask, contexts: ['editable', 'page'],
  });
}

async function fillTab(tabId) {
  const { mask, uf } = await getSettings();
  const args = [FakeData.profile(uf), FakeData.MASKABLE, mask];
  let results;
  try {
    results = await browser.scripting.executeScript({ target: { tabId, allFrames: true }, func: FD_FILL.fillForm, args });
  } catch {
    // Sem permissão para algum iframe de outra origem: preenche só o documento principal.
    results = await browser.scripting.executeScript({ target: { tabId }, func: FD_FILL.fillForm, args });
  }
  return results.reduce((n, r) => n + (r.result || 0), 0);
}

browser.runtime.onInstalled.addListener(buildMenus);
browser.runtime.onStartup.addListener(buildMenus);

browser.menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'fd-mask') {
    await browser.storage.local.set({ mask: info.checked });
    return;
  }
  if (info.menuItemId === 'fd-fill') {
    await fillTab(tab.id);
    return;
  }
  const id = String(info.menuItemId);
  if (!id.startsWith('fd-gen-')) return;

  const { mask, uf } = await getSettings();
  const value = FakeData.generate(id.slice('fd-gen-'.length), { mask, uf });
  await browser.scripting.executeScript({
    target: { tabId: tab.id, frameIds: [info.frameId || 0] },
    func: FD_FILL.insertValue,
    args: [value],
  });
});

browser.commands.onCommand.addListener(async (command, tab) => {
  if (command !== 'fill-form') return;
  const target = tab || (await browser.tabs.query({ active: true, currentWindow: true }))[0];
  if (target) await fillTab(target.id);
});

// Mantém o checkbox do menu sincronizado quando a máscara muda pelo popup.
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.mask) browser.menus.update('fd-mask', { checked: changes.mask.newValue }).catch(() => {});
});

browser.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === 'fill-form') return fillTab(msg.tabId);
  return undefined;
});
