/**
 * Barra lateral do Firefox (sidebarAction). O build do Chrome substitui este arquivo por
 * chrome/platform/sidebar.js, que usa o painel lateral (sidePanel).
 */
export const openSidebar = () => browser.sidebarAction.open();
export const closeSidebar = () => browser.sidebarAction.close();
