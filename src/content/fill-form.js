/**
 * Injetado na página por browser.scripting.executeScript({ func, args }). Precisa ser autocontido:
 * a função é serializada, e tudo o que ela usa chega por argumento.
 *
 * @param {Record<string, string>} profile  perfil achatado (core/factories.js → createFormProfile)
 * @param {object} options
 * @param {string[]} options.maskableKeys   chaves que podem perder a máscara
 * @param {boolean}  options.useMask
 * @param {[string, string][]} options.rules            [chave, fonte de RegExp] em ordem de prioridade
 * @param {Record<string, string>} options.autocomplete atributo autocomplete → chave
 * @returns {number} quantidade de campos preenchidos neste documento
 */
export function fillForm(profile, options) {
  const { maskableKeys, useMask, autocomplete } = options;
  const rules = options.rules.map(([key, source]) => [key, new RegExp(source)]);
  const maskable = new Set(maskableKeys);
  const SKIP_TYPES = ['hidden', 'submit', 'button', 'reset', 'file', 'image', 'checkbox', 'range', 'color', 'search'];

  const strip = (s) => String(s).replace(/[^0-9A-Za-z]/g, '');
  const norm = (s) => String(s || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[_\-.[\]]+/g, ' ');

  function labelText(el) {
    const parts = [];
    if (el.labels) for (const l of el.labels) parts.push(l.textContent);
    const ids = el.getAttribute('aria-labelledby');
    if (ids) ids.split(/\s+/).forEach((id) => { const n = document.getElementById(id); if (n) parts.push(n.textContent); });
    if (!parts.length) {
      // Rótulo "solto" logo antes do campo (comum em formulários sem <label for>).
      const prev = el.previousElementSibling;
      if (prev && prev.textContent.length < 60) parts.push(prev.textContent);
    }
    return parts.join(' ');
  }

  function keyFor(el) {
    const ac = (el.getAttribute('autocomplete') || '').trim().split(/\s+/).pop();
    if (autocomplete[ac]) return autocomplete[ac];
    if (el.type === 'email') return 'email';
    if (el.type === 'password') return 'senha';
    if (el.type === 'url') return 'site';
    const sources = [labelText(el), el.name, el.id, el.getAttribute('placeholder'), el.getAttribute('aria-label'),
      el.getAttribute('formcontrolname'), el.getAttribute('data-testid'), el.title].map(norm).filter(Boolean);
    for (const [key, re] of rules) if (sources.some((s) => re.test(s))) return key;
    if (el.type === 'tel') return 'celular';
    if (el.type === 'date') return 'nascimento';
    return null;
  }

  function isFillable(el) {
    if (SKIP_TYPES.includes(el.type) || el.disabled || el.readOnly) return false;
    const st = getComputedStyle(el);
    return st.display !== 'none' && st.visibility !== 'hidden' && el.getClientRects().length > 0;
  }

  function valueFor(key, el) {
    let v = profile[key];
    if (v == null || v === '') return null;
    v = String(v);
    if (el.type === 'date' && key === 'nascimento') return profile.nascimentoIso;
    if (el.type === 'month' && key === 'cartaoValidade') return profile.cartaoValidadeIso;
    if (el.type === 'number') return v.replace(/\D/g, '');
    if (maskable.has(key) && (!useMask || (el.maxLength > 0 && v.length > el.maxLength))) v = strip(v);
    if (el.maxLength > 0 && v.length > el.maxLength) v = v.slice(0, el.maxLength);
    return v;
  }

  // Setter nativo + eventos, para que React/Vue/Angular percebam a mudança.
  function setNative(el, v) {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function fillSelect(el, key) {
    const opts = [...el.options].filter((o) => !o.disabled && o.value !== '');
    if (!opts.length) return false;
    const raw = String(profile[key] ?? '');
    const wanted = [raw];
    if (key === 'uf') wanted.push(profile.estado);
    if (key === 'sexo') wanted.push(raw[0]);
    if (key === 'banco') wanted.push(profile.bancoCodigo, String(Number(profile.bancoCodigo)));
    if (key === 'estadoCivil') wanted.push(raw.replace('(a)', ''), raw.replace('(a)', 'a'));
    const w = wanted.filter(Boolean).map(norm);
    const match = opts.find((o) => w.includes(norm(o.value)) || w.includes(norm(o.text).trim()))
      || opts.find((o) => w.some((x) => x.length > 2 && norm(o.text).includes(x)));
    setNative(el, (match || opts[Math.floor(Math.random() * opts.length)]).value);
    return true;
  }

  function fillRadioGroup(el, done) {
    if (done.has(el.name) || keyFor(el) !== 'sexo') return false;
    done.add(el.name);
    const group = el.name ? [...document.getElementsByName(el.name)] : [el];
    const target = norm(profile.sexo);
    const hit = group.find((r) => {
      const t = norm(`${r.value} ${labelText(r)}`).trim();
      return t === target[0] || t.startsWith(target) || target.startsWith(t);
    });
    if (hit) hit.click();
    return Boolean(hit);
  }

  let count = 0;
  const radioGroups = new Set();
  for (const el of document.querySelectorAll('input, textarea, select')) {
    if (!isFillable(el)) continue;
    if (el.type === 'radio') {
      if (fillRadioGroup(el, radioGroups)) count++;
      continue;
    }
    const key = keyFor(el);
    if (!key) continue;
    if (el instanceof HTMLSelectElement) {
      if (fillSelect(el, key)) count++;
      continue;
    }
    const v = valueFor(key, el);
    if (v == null) continue;
    el.focus({ preventScroll: true });
    setNative(el, v);
    count++;
  }
  return count;
}
