/**
 * Raiz de composição do background. Em Manifest V3 o background é uma "event page": os listeners
 * precisam ser registrados de forma síncrona, no topo do módulo, para o navegador acordá-lo nos eventos.
 * No Chrome o mesmo módulo roda como service worker (manifest gerado por scripts/build-chrome.mjs).
 */
import '../platform/compat.js';
import { fillPage } from '../features/page-actions.js';
import { getActiveTab } from '../platform/browser-page.js';
import { settingsRepository } from '../platform/storage.js';
import { buildContextMenu, handleMenuClick, syncMaskCheckbox } from './context-menu.js';

browser.runtime.onInstalled.addListener(buildContextMenu);
browser.runtime.onStartup.addListener(buildContextMenu);
browser.menus.onClicked.addListener(handleMenuClick);

browser.commands.onCommand.addListener(async (command, tab) => {
  if (command !== 'fill-form') return;
  const target = tab || (await getActiveTab());
  if (target) await fillPage(target.id, await settingsRepository.get());
});

settingsRepository.onChange((patch) => {
  if ('mask' in patch) syncMaskCheckbox(patch.mask);
});
