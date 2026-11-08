/**
 * Padrão Command: cada ação do usuário que toca o navegador vira uma função isolada, que devolve o
 * resultado sem decidir como mostrá-lo (isso é papel de quem chama).
 */
import { fillPage, insertIntoPage } from '../features/page-actions.js';
import { closeSidebar, getActiveTab, openSidebar, requestHostAccess } from '../platform/browser-page.js';

export function createCommands({ isSidebar }) {
  /**
   * Na barra lateral não existe activeTab: é preciso pedir acesso às páginas. O pedido tem de sair
   * de forma síncrona dentro do clique, por isso é disparado antes de qualquer await.
   */
  const ensureAccess = () => (isSidebar ? requestHostAccess() : Promise.resolve(true));

  return {
    copy: (text) => navigator.clipboard.writeText(text),

    /** @returns {Promise<'ok' | 'no-field' | 'denied'>} */
    async insert(text) {
      const access = ensureAccess();
      if (!(await access)) return 'denied';
      const tab = await getActiveTab();
      return (await insertIntoPage(tab.id, text)) ? 'ok' : 'no-field';
    },

    /** @returns {Promise<number | 'denied'>} campos preenchidos */
    async fill(settings) {
      const access = ensureAccess();
      if (!(await access)) return 'denied';
      const tab = await getActiveTab();
      return fillPage(tab.id, settings);
    },

    /** No popup, abre a barra lateral e fecha o popup; na barra lateral, fecha a si mesma. */
    togglePin() {
      if (isSidebar) return closeSidebar();
      return openSidebar().then(() => window.close());
    },
  };
}
