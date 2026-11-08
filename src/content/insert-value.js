/**
 * Injetado na página por browser.scripting.executeScript({ func }). Precisa ser autocontido:
 * a função é serializada e não enxerga nada fora do próprio corpo.
 *
 * Insere `value` no campo focado (input, textarea ou contentEditable). Retorna true se inseriu.
 */
export function insertValue(value) {
  let el = document.activeElement;
  while (el && el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
  if (!el || el === document.body) return false;

  if (el.isContentEditable) {
    document.execCommand('insertText', false, value);
    return true;
  }
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return false;

  let v = value;
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (el.type === 'date' && br) v = `${br[3]}-${br[2]}-${br[1]}`;
  if (el.type === 'number') v = v.replace(/\D/g, '');
  if (el.maxLength > 0 && v.length > el.maxLength) v = v.replace(/[^0-9A-Za-z]/g, '').slice(0, el.maxLength);

  // Setter nativo: frameworks (React, Vue) sobrescrevem `value` na instância e ignorariam a atribuição comum.
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}
