/** Retorno visual: aviso no rodapé e destaque temporário da linha copiada/inserida. */
import { $ } from './dom.js';

let toastTimer;

export function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 1800);
}

export function flash(row) {
  if (!row) return;
  row.classList.add('copied');
  const use = row.querySelector('.act-copy use');
  use?.setAttribute('href', '#i-check');
  setTimeout(() => {
    row.classList.remove('copied');
    use?.setAttribute('href', '#i-copy');
  }, 1200);
}
