/** Abas acessíveis (padrão WAI-ARIA): clique e setas/Home/End trocam a aba; o painel acompanha. */

export function createTabs(nav, { onSelect }) {
  const tabs = () => [...nav.querySelectorAll('[role="tab"]')];
  let current = null;

  function select(name, { focus = false } = {}) {
    current = name;
    for (const tab of tabs()) {
      const on = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(on));
      tab.setAttribute('aria-controls', `tab-${tab.dataset.tab}`);
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    }
    for (const panel of document.querySelectorAll('[role="tabpanel"]')) panel.hidden = panel.id !== `tab-${name}`;
  }

  nav.addEventListener('click', (ev) => {
    const tab = ev.target.closest('[role="tab"]');
    if (tab) onSelect(tab.dataset.tab);
  });

  nav.addEventListener('keydown', (ev) => {
    const list = tabs();
    const i = list.findIndex((t) => t.dataset.tab === current);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: list.length - 1 }[ev.key];
    if (next === undefined) return;
    ev.preventDefault();
    const name = list[(next + list.length) % list.length].dataset.tab;
    select(name, { focus: true });
    onSelect(name);
  });

  return { select };
}
