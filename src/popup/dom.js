/** Pequenos construtores de DOM (sem innerHTML: todo texto entra como textContent). */

export const $ = (selector) => document.querySelector(selector);

export function el(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  for (const child of [].concat(children)) if (child != null) node.append(child);
  return node;
}

/** Ícone a partir dos <symbol> definidos em popup.html. */
export function icon(name) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(NS, 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}

export function iconButton(name, label, onclick, className = '') {
  return el('button', { type: 'button', className, title: label, ariaLabel: label, onclick }, icon(name));
}
