/**
 * Padrão Adapter: único ponto que conversa com as APIs de abas, permissões e injeção.
 * O resto do código pede "rode isto na página" sem conhecer os detalhes nem os casos de erro do navegador.
 */

export async function getActiveTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/**
 * Pede acesso a todas as páginas (necessário fora do popup, onde não há activeTab).
 * Deve ser chamado de forma síncrona dentro do clique do usuário — exigência do navegador.
 */
export const requestHostAccess = () => browser.permissions.request({ origins: ['<all_urls>'] });

/**
 * Executa `func(...args)` na aba. Sem frameId, tenta todos os frames e, se algum iframe de outra origem
 * recusar (falta de permissão), cai para o documento principal.
 * @returns {Promise<unknown[]>} o resultado de cada frame
 */
export async function runInPage(tabId, func, args = [], { frameId } = {}) {
  const run = async (target) => (await browser.scripting.executeScript({ target, func, args })).map((r) => r.result);
  if (frameId !== undefined) return run({ tabId, frameIds: [frameId] });
  try {
    return await run({ tabId, allFrames: true });
  } catch {
    return run({ tabId });
  }
}
