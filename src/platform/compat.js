/**
 * Compatibilidade Firefox/Chrome. O código usa a API do Firefox (`browser.*`, que já devolve Promises);
 * no Chrome ela se chama `chrome.*` e o menu de contexto é `contextMenus`.
 * Precisa ser o primeiro import das raízes de composição (background e popup).
 */
globalThis.browser ??= globalThis.chrome;
browser.menus ??= browser.contextMenus;
