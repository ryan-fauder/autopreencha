/**
 * Painel lateral do Chrome (sidePanel). Substitui src/platform/sidebar.js no build do Chrome.
 * O painel só abre dentro do gesto do usuário e exige o id da janela; por isso o id é obtido antes do
 * clique, assim que a página da extensão carrega.
 */
let windowId;
browser.windows.getCurrent().then((win) => { windowId = win.id; });

export const openSidebar = () => browser.sidePanel.open({ windowId });

/** O painel lateral é a própria página: fechar a janela fecha o painel. */
export async function closeSidebar() {
  window.close();
}
