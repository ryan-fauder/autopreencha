/*
 * Funções injetadas na página via browser.scripting.executeScript({ func }).
 * Precisam ser autocontidas: são serializadas e não enxergam nada fora do próprio corpo.
 */
(function (root) {
  'use strict';

  // Insere um valor no campo focado (input, textarea ou contentEditable).
  function insertValue(value) {
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

    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  // Preenche todos os campos reconhecíveis do documento com um perfil coerente.
  function fillForm(profile, maskableKeys, useMask) {
    const RULES = [
      ['senha', /senha|password|passwd|(^|[^a-z])pass([^a-z]|$)/],
      ['usuario', /user ?name|usuario|login|apelido|nickname/],
      ['email', /e-? ?mail/],
      ['cpf', /cpf/],
      ['cnpj', /cnpj/],
      ['inscricaoEstadual', /inscricao ?estadual|insc ?est|(^|[^a-z])ie([^a-z]|$)/],
      ['identidadeGenero', /identidade ?(de )?genero|gender ?identity/],
      ['orientacaoSexual', /orientacao|sexual ?orientation/],
      ['racaCor', /raca|etnia|race|ethnic|(^|[^a-z])cor([^a-z]|$)/],
      ['tipoSanguineo', /sangu|blood/],
      ['rg', /(^|[^a-z])rg([^a-z]|$)|identidade|registro ?geral/],
      ['orgaoEmissor', /orgao|emissor|expedidor/],
      ['cnh', /cnh|habilitacao|driver/],
      ['pis', /(^|[^a-z])(pis|nis|nit)([^a-z]|$)|pasep/],
      ['cns', /cns|cartao ?(do )?sus|(^|[^a-z])sus([^a-z]|$)/],
      ['titulo', /titulo|eleitor/],
      ['passaporte', /passaporte|passport/],
      ['renavam', /renavam/],
      ['placa', /placa|license ?plate/],
      ['chassi', /chassi|(^|[^a-z])vin([^a-z]|$)/],
      ['cartaoNome', /nome ?(impresso|no ?cartao|do ?titular)|card ?holder|holder|cc ?name/],
      ['cartaoCvv', /cvv|cvc|csc|codigo ?(de )?seguranca|security ?code/],
      ['cartaoValidade', /validade|vencimento|expir|exp ?date|(^|[^a-z])exp([^a-z]|$)/],
      ['cartaoNumero', /cartao|card ?num|cc ?num|credit/],
      ['agencia', /agencia|agency|branch/],
      ['conta', /(^|[^a-z])conta([^a-z]|$)|account ?(number|num)/],
      ['banco', /banco|bank/],
      ['mae', /(^|[^a-z])mae([^a-z]|$)|mother/],
      ['pai', /(^|[^a-z])pai([^a-z]|$)|father/],
      ['razaoSocial', /razao|company|empresa|corporate|organization/],
      ['nomeFantasia', /fantasia|trade ?name/],
      ['sobrenome', /sobrenome|last ?name|surname|family ?name/],
      ['primeiroNome', /primeiro ?nome|first ?name|given ?name|prenome/],
      ['nascimento', /nasc|birth|bday|aniversario/],
      ['idade', /(^|[^a-z])(idade|age)([^a-z]|$)/],
      ['estadoCivil', /estado ?civil|marital/],
      ['sexo', /sexo|(^|[^a-z])sex([^a-z]|$)|genero|gender/],
      ['profissao', /profissao|ocupacao|cargo|occupation|job/],
      ['celular', /celular|mobile|(^|[^a-z])cel([^a-z]|$)|whats/],
      ['telefone', /telefone|phone|fone|(^|[^a-z])tel([^a-z]|$)/],
      ['cep', /(^|[^a-z])cep([^a-z]|$)|zip|postal/],
      ['complemento', /complemento|complement|address ?line ?2|apto/],
      ['numero', /numero|(^|[^a-z])(num|nro|no)([^a-z]|$)|number/],
      ['bairro', /bairro|district|neighbo/],
      ['cidade', /cidade|municipio|city|town/],
      ['uf', /(^|[^a-z])uf([^a-z]|$)|estado|state|province/],
      ['logradouro', /logradouro|endereco|address|(^|[^a-z])rua([^a-z]|$)|street/],
      ['pais', /pais|country/],
      ['site', /site|url|homepage/],
      ['nome', /nome|name/],
    ];

    const AUTOCOMPLETE = {
      'given-name': 'primeiroNome', 'family-name': 'sobrenome', name: 'nome', email: 'email',
      tel: 'celular', 'tel-national': 'celular', 'postal-code': 'cep', 'street-address': 'logradouro',
      'address-line1': 'logradouro', 'address-line2': 'complemento', 'address-level2': 'cidade',
      'address-level1': 'uf', bday: 'nascimento', sex: 'sexo', 'cc-number': 'cartaoNumero',
      'cc-name': 'cartaoNome', 'cc-exp': 'cartaoValidade', 'cc-csc': 'cartaoCvv', username: 'usuario',
      'new-password': 'senha', 'current-password': 'senha', organization: 'razaoSocial',
      country: 'pais', 'country-name': 'pais', url: 'site',
    };

    const SKIP_TYPES = ['hidden', 'submit', 'button', 'reset', 'file', 'image', 'checkbox', 'range', 'color', 'search'];
    const maskable = new Set(maskableKeys);
    const strip = (s) => String(s).replace(/[^0-9A-Za-z]/g, '');
    const norm = (s) => String(s || '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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
      if (AUTOCOMPLETE[ac]) return AUTOCOMPLETE[ac];
      if (el.type === 'email') return 'email';
      if (el.type === 'password') return 'senha';
      if (el.type === 'url') return 'site';
      const attrs = [el.name, el.id, el.getAttribute('placeholder'), el.getAttribute('aria-label'),
        el.getAttribute('formcontrolname'), el.getAttribute('data-testid'), el.title];
      const sources = [labelText(el), ...attrs].map(norm).filter(Boolean);
      // A primeira regra que casar com qualquer fonte vence (ordem = prioridade).
      for (const [key, re] of RULES) if (sources.some((s) => re.test(s))) return key;
      if (el.type === 'tel') return 'celular';
      if (el.type === 'date') return 'nascimento';
      return null;
    }

    function isVisible(el) {
      if (el.disabled || el.readOnly) return false;
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
      const chosen = match || opts[Math.floor(Math.random() * opts.length)];
      setNative(el, chosen.value);
      return true;
    }

    let count = 0;
    const handledRadio = new Set();
    const fields = document.querySelectorAll('input, textarea, select');

    for (const el of fields) {
      if (SKIP_TYPES.includes(el.type) || !isVisible(el)) continue;

      if (el.type === 'radio') {
        if (handledRadio.has(el.name)) continue;
        const key = keyFor(el);
        if (key !== 'sexo') continue;
        const group = el.name ? [...document.getElementsByName(el.name)] : [el];
        const target = norm(profile.sexo);
        const hit = group.find((r) => {
          const t = norm(r.value + ' ' + labelText(r)).trim();
          return t === target[0] || t.startsWith(target) || target.startsWith(t);
        });
        if (hit) { hit.click(); count++; }
        handledRadio.add(el.name);
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

  root.FD_FILL = { insertValue, fillForm };
})(globalThis);
