/*
 * Geradores de dados fictícios brasileiros com dígitos verificadores válidos.
 * Todos os geradores retornam o valor COM máscara; use FakeData.unmask() para remover.
 */
(function (root) {
  'use strict';

  const D = root.FD_DATA;

  // ---------------------------------------------------------------- utilitários

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[rand(0, arr.length - 1)];
  const digits = (n) => Array.from({ length: n }, () => rand(0, 9));
  const allEqual = (arr) => arr.every((x) => x === arr[0]);
  const wsum = (arr, weights) => arr.reduce((s, x, i) => s + x * weights[i], 0);
  const desc = (from, to) => Array.from({ length: from - to + 1 }, (_, i) => from - i);
  const asc = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const pad = (n, len) => String(n).padStart(len, '0');
  const mod11 = (sum) => { const r = sum % 11; return r < 2 ? 0 : 11 - r; };
  const fmt = (str, mask) => { let i = 0; return mask.replace(/#/g, () => str[i++] ?? ''); };
  const unmask = (value) => String(value).replace(/[^0-9A-Za-z]/g, '');
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = () => LETTERS[rand(0, 25)];
  const stripAccents = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const slug = (s) => stripAccents(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
  const money = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const pickOther = (arr, not) => { let v; do { v = pick(arr); } while (v === not); return v; };

  const UFS = Object.keys(D.states);
  const normUf = (uf) => (uf && D.states[uf.toUpperCase()] ? uf.toUpperCase() : null);
  const cityFor = (uf) => {
    const u = normUf(uf);
    return pick(u ? D.cities.filter((c) => c.uf === u) : D.cities);
  };

  // ---------------------------------------------------------------- pessoa física

  // 9º dígito do CPF indica a região fiscal de emissão.
  const CPF_REGION = {
    RS: 0, DF: 1, GO: 1, MS: 1, MT: 1, TO: 1, AC: 2, AM: 2, AP: 2, PA: 2, RO: 2, RR: 2,
    CE: 3, MA: 3, PI: 3, AL: 4, PB: 4, PE: 4, RN: 4, BA: 5, SE: 5, MG: 6, ES: 7, RJ: 7, SP: 8, PR: 9, SC: 9,
  };

  function cpf(uf) {
    let d;
    do {
      d = digits(9);
      const u = normUf(uf);
      if (u) d[8] = CPF_REGION[u];
    } while (allEqual(d));
    d.push(mod11(wsum(d, desc(10, 2))));
    d.push(mod11(wsum(d, desc(11, 2))));
    return fmt(d.join(''), '###.###.###-##');
  }

  // RG no padrão SSP-SP (módulo 11, DV pode ser "X").
  function rg() {
    const d = digits(8);
    const r = 11 - (wsum(d, asc(2, 9)) % 11);
    const dv = r === 10 ? 'X' : r === 11 ? '0' : String(r);
    return fmt(d.join('') + dv, '##.###.###-#');
  }

  function cnh() {
    let d, dv1, dv2;
    // Descarta os casos-limite (resto >= 10), onde os validadores divergem entre si.
    do {
      d = digits(9);
      dv1 = wsum(d, desc(9, 1)) % 11;
      dv2 = wsum(d, asc(1, 9)) % 11;
    } while (allEqual(d) || d[0] === 0 || dv1 >= 10 || dv2 >= 10);
    return d.join('') + dv1 + dv2;
  }

  function pis() {
    let d;
    do { d = digits(10); } while (allEqual(d) || d[0] === 0);
    const r = 11 - (wsum(d, [3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) % 11);
    d.push(r >= 10 ? 0 : r);
    return fmt(d.join(''), '###.#####.##-#');
  }

  // Cartão Nacional de Saúde definitivo (inicia com 1 ou 2).
  function cns() {
    const base = [rand(1, 2), ...digits(10)];
    let sum = wsum(base, desc(15, 5));
    let dv = 11 - (sum % 11);
    let middle = '000';
    if (dv === 11) dv = 0;
    if (dv === 10) {
      sum += 2;
      dv = 11 - (sum % 11);
      middle = '001';
    }
    return fmt(base.join('') + middle + dv, '### #### #### ####');
  }

  const TITULO_UF = {
    SP: 1, MG: 2, RJ: 3, RS: 4, BA: 5, PR: 6, CE: 7, PE: 8, SC: 9, GO: 10, MA: 11, PB: 12, PA: 13, ES: 14,
    PI: 15, RN: 16, AL: 17, MT: 18, MS: 19, DF: 20, SE: 21, AM: 22, RO: 23, AC: 24, AP: 25, RR: 26, TO: 27,
  };

  function tituloEleitor(uf) {
    const u = normUf(uf) || pick(UFS);
    const code = TITULO_UF[u];
    const spMg = code === 1 || code === 2;
    const seq = digits(8);
    const dvOf = (r) => (r === 10 ? 0 : r === 0 && spMg ? 1 : r);
    const dv1 = dvOf(wsum(seq, asc(2, 9)) % 11);
    const ufd = pad(code, 2).split('').map(Number);
    const dv2 = dvOf((ufd[0] * 7 + ufd[1] * 8 + dv1 * 9) % 11);
    return fmt(seq.join('') + pad(code, 2) + dv1 + dv2, '#### #### ####');
  }

  function passaporte() {
    return pick(['F', 'G', 'Y']) + letter() + digits(6).join('');
  }

  function birthDate(minAge = 18, maxAge = 80) {
    // Sorteia entre a data mais antiga e a mais recente que resultam na faixa de idade pedida.
    const now = new Date();
    const latest = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
    const earliest = new Date(now.getFullYear() - maxAge - 1, now.getMonth(), now.getDate() + 1);
    const dt = new Date(earliest.getTime() + Math.random() * (latest.getTime() - earliest.getTime()));
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    const d = dt.getDate();
    let age = now.getFullYear() - y;
    if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
    return { br: `${pad(d, 2)}/${pad(m, 2)}/${y}`, iso: `${y}-${pad(m, 2)}-${pad(d, 2)}`, age };
  }

  function nome(sexo) {
    const s = sexo || pick(['Masculino', 'Feminino']);
    const first = pick(s === 'Masculino' ? D.maleNames : D.femaleNames);
    const s1 = pick(D.surnames);
    return `${first} ${s1} ${pickOther(D.surnames, s1)}`;
  }

  function email(fullName) {
    const parts = stripAccents(fullName || nome()).toLowerCase().split(/\s+/);
    const first = parts[0];
    const last = parts[parts.length - 1];
    const user = pick([
      `${first}.${last}`, `${first}${last}`, `${first}_${last}`, `${first}.${last}${rand(1, 99)}`,
      `${first[0]}${last}${rand(10, 999)}`, `${first}${rand(1970, 2005)}`,
    ]);
    return `${user}@${pick(D.emailDomains)}`;
  }

  // ---------------------------------------------------------------- contato / endereço

  const celular = (ddd) => `(${ddd || cityFor().ddd}) 9${rand(6, 9)}${digits(3).join('')}-${digits(4).join('')}`;
  const telefone = (ddd) => `(${ddd || cityFor().ddd}) ${rand(2, 5)}${digits(3).join('')}-${digits(4).join('')}`;
  const cep = (city) => {
    const c = city || cityFor();
    return fmt(pad(rand(c.cepMin, c.cepMax), 8), '#####-###');
  };

  function endereco(uf) {
    const c = cityFor(uf);
    const e = {
      logradouro: `${pick(D.streetTypes)} ${pick(D.streetNames)}`,
      numero: String(rand(1, 3500)),
      complemento: pick(D.complements),
      bairro: pick(D.neighborhoods),
      cidade: c.city,
      uf: c.uf,
      estado: D.states[c.uf],
      cep: cep(c),
      ddd: c.ddd,
    };
    e.completo = `${e.logradouro}, ${e.numero}${e.complemento ? ' - ' + e.complemento : ''} - ${e.bairro}, ${e.cidade} - ${e.uf}, ${e.cep}`;
    return e;
  }

  // ---------------------------------------------------------------- pessoa jurídica

  function cnpjDv(values) {
    const dv1 = mod11(wsum(values, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
    const dv2 = mod11(wsum([...values, dv1], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
    return `${dv1}${dv2}`;
  }

  function cnpj() {
    let base;
    do { base = digits(8); } while (allEqual(base));
    const d = [...base, 0, 0, 0, 1];
    return fmt(d.join('') + cnpjDv(d), '##.###.###/####-##');
  }

  // CNPJ alfanumérico (IN RFB 2.229/2024): valor do caractere = código ASCII - 48.
  function cnpjAlfanumerico() {
    const ALNUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let chars;
    do {
      chars = [...Array.from({ length: 8 }, () => pick([...ALNUM])), '0', '0', '0', '1'];
    } while (!chars.some((c) => /[A-Z]/.test(c)));
    const dv = cnpjDv(chars.map((c) => c.charCodeAt(0) - 48));
    return fmt(chars.join('') + dv, '##.###.###/####-##');
  }

  // Inscrição Estadual: algoritmo próprio de cada UF (tabela do SINTEGRA).
  const ieMod11 = (base, weights) => mod11(wsum(base, weights));
  const ieDv11 = (base, weights) => { const r = 11 - (wsum(base, weights) % 11); return r >= 10 ? 0 : r; };
  const ieTimes10 = (base, weights) => { const r = (wsum(base, weights) * 10) % 11; return r === 10 ? 0 : r; };
  const ieGeneric9 = (prefix, mask) => () => {
    const b = [...prefix, ...digits(8 - prefix.length)];
    return fmt(b.join('') + ieMod11(b, desc(9, 2)), mask);
  };

  const IE = {
    AC: () => {
      const b = [0, 1, ...digits(9)];
      b.push(ieDv11(b, [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
      b.push(ieDv11(b, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
      return fmt(b.join(''), '##.###.###/###-##');
    },
    AL: () => {
      const b = [2, 4, pick([0, 3, 5, 7, 8]), ...digits(5)];
      return b.join('') + ieTimes10(b, desc(9, 2));
    },
    AP: () => {
      // Faixa acima de 03019022: p = 0 e d = 0.
      const b = [0, 3, rand(1, 9), ...digits(5)];
      const r = 11 - (wsum(b, desc(9, 2)) % 11);
      return b.join('') + (r >= 10 ? 0 : r);
    },
    AM: ieGeneric9([rand(0, 9)], '##.###.###-#'),
    BA: () => {
      const b = [rand(0, 9), ...digits(5)];
      const modulo = [6, 7, 9].includes(b[0]) ? 11 : 10;
      const calc = (arr, weights) => {
        const s = wsum(arr, weights);
        if (modulo === 10) { const r = s % 10; return r === 0 ? 0 : 10 - r; }
        return mod11(s);
      };
      const dv2 = calc(b, desc(7, 2));
      const dv1 = calc([...b, dv2], desc(8, 2));
      return fmt(b.join('') + dv1 + dv2, '######-##');
    },
    CE: ieGeneric9([0, 6], '########-#'),
    DF: () => {
      const b = [0, 7, ...digits(9)];
      b.push(ieDv11(b, [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
      b.push(ieDv11(b, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
      return fmt(b.join(''), '###########-##');
    },
    ES: ieGeneric9([0, 8], '###.###.##-#'),
    GO: () => {
      const b = [1, pick([0, 1, 5]), ...digits(6)];
      const n = Number(b.join(''));
      const r = wsum(b, desc(9, 2)) % 11;
      const dv = r === 0 ? 0 : r === 1 ? (n >= 10103105 && n <= 10119997 ? 1 : 0) : 11 - r;
      return fmt(b.join('') + dv, '##.###.###-#');
    },
    MA: ieGeneric9([1, 2], '#########'),
    MT: () => {
      const b = digits(10);
      return fmt(b.join('') + ieMod11(b, [3, 2, 9, 8, 7, 6, 5, 4, 3, 2]), '##########-#');
    },
    MS: ieGeneric9([2, 8], '#########'),
    MG: () => {
      const b = digits(11); // 3 município + 6 sequencial + 2 ordem
      const withZero = [...b.slice(0, 3), 0, ...b.slice(3)];
      let s = 0;
      withZero.forEach((x, i) => { const p = x * (i % 2 === 0 ? 1 : 2); s += Math.floor(p / 10) + (p % 10); });
      const dv1 = (10 - (s % 10)) % 10;
      const dv2 = ieMod11([...b, dv1], [3, 2, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
      return fmt(b.join('') + dv1 + dv2, '###.###.###/####');
    },
    PA: ieGeneric9([1, 5], '##-######-#'),
    PB: ieGeneric9([1, 6], '########-#'),
    PR: () => {
      const b = digits(8);
      b.push(ieMod11(b, [3, 2, 7, 6, 5, 4, 3, 2]));
      b.push(ieMod11(b, [4, 3, 2, 7, 6, 5, 4, 3, 2]));
      return fmt(b.join(''), '########-##');
    },
    PE: () => {
      const b = digits(7);
      b.push(ieMod11(b, desc(8, 2)));
      b.push(ieMod11(b, desc(9, 2)));
      return fmt(b.join(''), '#######-##');
    },
    PI: ieGeneric9([1, 9], '#########'),
    RJ: () => {
      const b = digits(7);
      return fmt(b.join('') + ieMod11(b, [2, 7, 6, 5, 4, 3, 2]), '##.###.##-#');
    },
    RN: () => {
      const b = [2, 0, ...digits(6)];
      return fmt(b.join('') + ieTimes10(b, desc(9, 2)), '##.###.###-#');
    },
    RS: () => {
      const b = [...pad(rand(1, 467), 3).split('').map(Number), ...digits(6)];
      return fmt(b.join('') + ieDv11(b, [2, 9, 8, 7, 6, 5, 4, 3, 2]), '###/#######');
    },
    RO: () => {
      let b, r;
      // Resto 1 é tratado de forma diferente entre validadores; evita esse caso.
      do {
        b = [rand(1, 9), ...digits(12)];
        r = wsum(b, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) % 11;
      } while (r === 1);
      const dv = r === 0 ? 1 : 11 - r;
      return fmt(b.join('') + dv, '#############-#');
    },
    RR: () => {
      const b = [2, 4, ...digits(6)];
      return fmt(b.join('') + (wsum(b, asc(1, 8)) % 9), '########-#');
    },
    SC: ieGeneric9([2, 5], '###.###.###'),
    SP: () => {
      const b = digits(8);
      const dv1 = (wsum(b, [1, 3, 4, 5, 6, 7, 8, 10]) % 11) % 10;
      const b2 = [...b, dv1, ...digits(2)];
      const dv2 = (wsum(b2, [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2]) % 11) % 10;
      return fmt(b2.join('') + dv2, '###.###.###.###');
    },
    SE: ieGeneric9([2, 7], '##.###.###-#'),
    TO: () => {
      // Formato de 11 dígitos: os dígitos 3 e 4 (tipo) não entram no cálculo.
      const b = [2, 9, ...digits(6)];
      const tipo = pick(['01', '02', '03', '99']);
      return fmt(`${b.slice(0, 2).join('')}${tipo}${b.slice(2).join('')}${ieMod11(b, desc(9, 2))}`, '##.##.######-#');
    },
  };

  function inscricaoEstadual(uf) {
    const u = normUf(uf) || pick(UFS);
    return IE[u]();
  }

  function razaoSocial() {
    return `${pick(D.surnames)} ${pick(D.companyActivities)} ${pick(D.companySuffixes)}`;
  }

  // ---------------------------------------------------------------- veículos

  function renavam() {
    let b;
    do { b = digits(10); } while (allEqual(b));
    return b.join('') + ieTimes10(b, [3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  }

  // No padrão antigo só foram emitidas as séries até SAV (SAW0001–ZZZ9999 não existem).
  function placa() {
    let l;
    do { l = `${letter()}${letter()}${letter()}`; } while (l >= 'SAW');
    return `${l}-${digits(4).join('')}`;
  }
  const placaMercosul = () => `${letter()}${letter()}${letter()}${rand(0, 9)}${letter()}${digits(2).join('')}`;

  function chassi(wmi) {
    const VIN_CHARS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
    const tail = Array.from({ length: 14 }, () => pick([...VIN_CHARS])).join('');
    return (wmi || pick(D.vehicles).wmi) + tail;
  }

  // ---------------------------------------------------------------- financeiro

  const CARD_BRANDS = {
    visa: { label: 'Visa', prefixes: ['4'], length: 16, cvv: 3 },
    mastercard: { label: 'Mastercard', prefixes: ['51', '52', '53', '54', '55', '2221', '2300', '2500', '2720'], length: 16, cvv: 3 },
    elo: { label: 'Elo', prefixes: ['636368', '438935', '504175', '451416', '636297', '506699', '509048', '650031'], length: 16, cvv: 3 },
    amex: { label: 'American Express', prefixes: ['34', '37'], length: 15, cvv: 4 },
    hipercard: { label: 'Hipercard', prefixes: ['606282'], length: 16, cvv: 3 },
    diners: { label: 'Diners Club', prefixes: ['36', '38'], length: 14, cvv: 3 },
    discover: { label: 'Discover', prefixes: ['6011', '65'], length: 16, cvv: 3 },
    jcb: { label: 'JCB', prefixes: ['3528', '3589'], length: 16, cvv: 3 },
  };

  function luhnDigit(payload) {
    let sum = 0;
    for (let i = 0; i < payload.length; i++) {
      let d = payload[payload.length - 1 - i];
      if (i % 2 === 0) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
    }
    return (10 - (sum % 10)) % 10;
  }

  function cartao(brandKey, holderName) {
    const key = CARD_BRANDS[brandKey] ? brandKey : pick(Object.keys(CARD_BRANDS));
    const brand = CARD_BRANDS[key];
    const prefix = pick(brand.prefixes).split('').map(Number);
    const payload = [...prefix, ...digits(brand.length - prefix.length - 1)];
    const num = payload.join('') + luhnDigit(payload);
    const mask = brand.length === 15 ? '#### ###### #####' : brand.length === 14 ? '#### ###### ####' : '#### #### #### ####';
    const now = new Date();
    const exp = new Date(now.getFullYear() + rand(1, 6), rand(0, 11), 1);
    return {
      bandeira: brand.label,
      bandeiraKey: key,
      numero: fmt(num, mask),
      nome: stripAccents(holderName || nome()).toUpperCase(),
      validade: `${pad(exp.getMonth() + 1, 2)}/${String(exp.getFullYear()).slice(2)}`,
      validadeIso: `${exp.getFullYear()}-${pad(exp.getMonth() + 1, 2)}`,
      cvv: digits(brand.cvv).join(''),
    };
  }

  // Agência/conta. BB, Bradesco, Itaú e Caixa usam o algoritmo oficial de cada banco;
  // os demais recebem DV módulo 11 genérico.
  const BANK_ACCOUNT = {
    '001': () => {
      const dvBB = (arr, w) => { const r = 11 - (wsum(arr, w) % 11); return r === 10 ? 'X' : r === 11 ? '0' : String(r); };
      const ag = digits(4);
      const ct = [rand(1, 9), ...digits(7)];
      return { agencia: `${ag.join('')}-${dvBB(ag, [5, 4, 3, 2])}`, conta: `${ct.join('')}-${dvBB(ct, desc(9, 2))}`, oficial: true };
    },
    '237': () => {
      const dvBra = (arr, w) => { const r = 11 - (wsum(arr, w) % 11); return r === 10 ? 'P' : r === 11 ? '0' : String(r); };
      const ag = digits(4);
      const ct = digits(7);
      return { agencia: `${ag.join('')}-${dvBra(ag, [5, 4, 3, 2])}`, conta: `${ct.join('')}-${dvBra(ct, [2, 7, 6, 5, 4, 3, 2])}`, oficial: true };
    },
    '341': () => {
      const ag = digits(4);
      const ct = digits(5);
      let s = 0;
      [...ag, ...ct].forEach((x, i) => { const p = x * (i % 2 === 0 ? 2 : 1); s += Math.floor(p / 10) + (p % 10); });
      return { agencia: ag.join(''), conta: `${ct.join('')}-${(10 - (s % 10)) % 10}`, oficial: true };
    },
    '104': () => {
      const ag = digits(4);
      const op = pick([[0, 0, 1], [0, 1, 3]]);
      const ct = [0, 0, 0, ...digits(5)];
      const dv = ieTimes10([...ag, ...op, ...ct], [8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
      return { agencia: ag.join(''), conta: `${op.join('')}.${ct.join('')}-${dv}`, oficial: true };
    },
  };

  function contaBancaria(bankCode) {
    const bank = D.banks.find((b) => b.code === bankCode) || pick(D.banks);
    const gen = BANK_ACCOUNT[bank.code];
    let acc;
    if (gen) acc = gen();
    else {
      const ct = digits(rand(6, 9));
      acc = { agencia: pad(rand(1, 9999), 4), conta: `${ct.join('')}-${ieMod11(ct, ct.map((_, i) => (i % 8) + 2).reverse())}`, oficial: false };
    }
    return { banco: `${bank.code} - ${bank.name}`, codigo: bank.code, nomeBanco: bank.name, tipo: pick(['Conta corrente', 'Conta poupança']), ...acc };
  }

  // ---------------------------------------------------------------- imóveis

  // Código Nacional de Matrícula (Provimento CNJ 143/2023): CNS(6) + livro(1) + matrícula(7) + DV(2),
  // DV pelo algoritmo ISO 7064 MOD 97-10.
  function mod97dv(numStr) {
    let r = 0;
    for (const ch of numStr + '00') r = (r * 10 + Number(ch)) % 97;
    return pad(98 - r, 2);
  }

  function matriculaCnm(cnsCartorio, numero) {
    const base = `${cnsCartorio || pad(rand(100000, 199999), 6)}2${pad(numero || rand(1, 250000), 7)}`;
    return fmt(base + mod97dv(base), '######.#.#######-##');
  }

  function inscricaoIptu() {
    const b = digits(10);
    return fmt(b.join('') + ieMod11(b, [3, 2, 9, 8, 7, 6, 5, 4, 3, 2]), '###.###.####-#');
  }

  function imovel(uf) {
    const t = pick(D.propertyTypes);
    const end = endereco(uf);
    const area = rand(t.areaMin, t.areaMax);
    const precoM2 = t.type === 'Terreno' ? rand(400, 3000) : t.type === 'Galpão' ? rand(1500, 4000) : rand(3500, 12000);
    const venda = Math.round((area * precoM2) / 1000) * 1000;
    const aluguel = Math.round((venda * rand(35, 60)) / 100000) * 10;
    const quartos = rand(t.roomsMin, t.roomsMax);
    const cnsCartorio = pad(rand(100000, 199999), 6);
    const numMatricula = rand(1, 250000);
    return {
      tipo: t.type,
      finalidade: pick(['Venda', 'Locação', 'Venda e locação']),
      endereco: end,
      areaTotal: `${area} m²`,
      areaUtil: `${t.type === 'Terreno' ? area : Math.round(area * rand(75, 95) / 100)} m²`,
      quartos: String(quartos),
      suites: String(quartos ? rand(0, Math.min(quartos, 3)) : 0),
      banheiros: String(t.type === 'Terreno' ? 0 : Math.max(1, quartos ? rand(1, quartos + 1) : rand(1, 4))),
      vagas: String(rand(t.parkingMax ? 1 : 0, t.parkingMax)),
      anoConstrucao: t.type === 'Terreno' ? '-' : String(rand(1970, new Date().getFullYear() - 1)),
      valorVenda: money(venda),
      valorAluguel: money(aluguel),
      condominio: t.condo ? money(rand(25, 160) * 10) : 'Não possui',
      iptuAnual: money(Math.round(venda * rand(4, 12) / 1000)),
      inscricaoIptu: inscricaoIptu(),
      cartorio: `${rand(1, 9)}º Ofício de Registro de Imóveis de ${end.cidade}`,
      cnsCartorio,
      matricula: numMatricula.toLocaleString('pt-BR'),
      cnm: matriculaCnm(cnsCartorio, numMatricula),
      proprietario: nome(),
      cpfProprietario: cpf(end.uf),
    };
  }

  // ---------------------------------------------------------------- agregados

  function pessoa(uf) {
    const sexo = pick(['Masculino', 'Feminino']);
    const first = pick(sexo === 'Masculino' ? D.maleNames : D.femaleNames);
    const sobMae = pick(D.surnames);
    const sobPai = pickOther(D.surnames, sobMae);
    const nomeCompleto = `${first} ${sobMae} ${sobPai}`;
    const nasc = birthDate(18, 80);
    const end = endereco(uf);
    return {
      nome: nomeCompleto,
      primeiroNome: first,
      sobrenome: `${sobMae} ${sobPai}`,
      sexo,
      nascimento: nasc.br,
      nascimentoIso: nasc.iso,
      idade: String(nasc.age),
      mae: `${pick(D.femaleNames)} ${pickOther(D.surnames, sobMae)} ${sobMae}`,
      pai: `${pick(D.maleNames)} ${pickOther(D.surnames, sobPai)} ${sobPai}`,
      cpf: cpf(end.uf),
      rg: rg(),
      orgaoEmissor: `SSP/${end.uf}`,
      cnh: cnh(),
      categoriaCnh: pick(['A', 'B', 'AB', 'AB', 'B', 'C', 'D', 'E']),
      pis: pis(),
      cns: cns(),
      titulo: tituloEleitor(end.uf),
      passaporte: passaporte(),
      email: email(nomeCompleto),
      usuario: `${slug(first)}.${slug(sobPai)}${rand(1, 99)}`,
      senha: `${first.slice(0, 1).toUpperCase()}${slug(sobPai).slice(0, 4)}@${rand(1000, 9999)}`,
      celular: celular(end.ddd),
      telefone: telefone(end.ddd),
      estadoCivil: pick(D.estadoCivil),
      profissao: pick(D.profissoes),
      racaCor: pick(D.racaCor),
      orientacaoSexual: pick(D.orientacaoSexual),
      identidadeGenero: pick(D.identidadeGenero),
      tipoSanguineo: pick(D.tiposSanguineos),
      altura: `${(rand(150, 195) / 100).toFixed(2).replace('.', ',')} m`,
      peso: `${rand(50, 110)} kg`,
      endereco: end,
    };
  }

  function empresa(uf) {
    const end = endereco(uf);
    const fantasia = `${pick(D.fantasyWords)} ${pick(D.companyActivities).split(' ')[0]}`;
    const domain = `${slug(fantasia)}.com.br`;
    const abertura = birthDate(1, 40);
    return {
      razaoSocial: `${fantasia} ${pick(D.companySuffixes)}`,
      nomeFantasia: fantasia,
      cnpj: cnpj(),
      cnpjAlfanumerico: cnpjAlfanumerico(),
      inscricaoEstadual: inscricaoEstadual(end.uf),
      inscricaoMunicipal: digits(8).join(''),
      dataAbertura: abertura.br,
      email: `contato@${domain}`,
      site: `https://www.${domain}`,
      telefone: telefone(end.ddd),
      celular: celular(end.ddd),
      endereco: end,
    };
  }

  function veiculo(uf) {
    const v = pick(D.vehicles);
    const anoFab = rand(2008, new Date().getFullYear());
    return {
      marca: v.brand,
      modelo: pick(v.models),
      anoFabricacao: String(anoFab),
      anoModelo: String(anoFab + rand(0, 1)),
      cor: pick(D.vehicleColors),
      combustivel: pick(D.fuels),
      placa: placa(),
      placaMercosul: placaMercosul(),
      renavam: renavam(),
      chassi: chassi(v.wmi),
      uf: normUf(uf) || pick(UFS),
    };
  }

  // ---------------------------------------------------------------- registro de tipos simples

  // Tipos de valor único, usados no menu de contexto e no gerador rápido do popup.
  const TYPES = [
    { id: 'cpf', label: 'CPF', group: 'Pessoa', gen: (o) => cpf(o.uf) },
    { id: 'rg', label: 'RG', group: 'Pessoa', gen: () => rg() },
    { id: 'cnh', label: 'CNH', group: 'Pessoa', gen: () => cnh() },
    { id: 'pis', label: 'PIS/PASEP', group: 'Pessoa', gen: () => pis() },
    { id: 'cns', label: 'CNS (Cartão SUS)', group: 'Pessoa', gen: () => cns() },
    { id: 'titulo', label: 'Título de Eleitor', group: 'Pessoa', gen: (o) => tituloEleitor(o.uf) },
    { id: 'passaporte', label: 'Passaporte', group: 'Pessoa', gen: () => passaporte() },
    { id: 'nome', label: 'Nome completo', group: 'Pessoa', gen: () => nome(), text: true },
    { id: 'nascimento', label: 'Data de nascimento', group: 'Pessoa', gen: () => birthDate().br },
    { id: 'email', label: 'E-mail', group: 'Pessoa', gen: () => email(), text: true },
    { id: 'tipoSanguineo', label: 'Tipo sanguíneo', group: 'Pessoa', gen: () => pick(D.tiposSanguineos), text: true },
    { id: 'cnpj', label: 'CNPJ', group: 'Empresa', gen: () => cnpj() },
    { id: 'cnpjAlfa', label: 'CNPJ alfanumérico', group: 'Empresa', gen: () => cnpjAlfanumerico() },
    { id: 'ie', label: 'Inscrição Estadual', group: 'Empresa', gen: (o) => inscricaoEstadual(o.uf) },
    { id: 'razaoSocial', label: 'Razão social', group: 'Empresa', gen: () => razaoSocial(), text: true },
    { id: 'celular', label: 'Celular', group: 'Contato', gen: (o) => celular(cityFor(o.uf).ddd) },
    { id: 'telefone', label: 'Telefone fixo', group: 'Contato', gen: (o) => telefone(cityFor(o.uf).ddd) },
    { id: 'cep', label: 'CEP', group: 'Contato', gen: (o) => cep(cityFor(o.uf)) },
    { id: 'endereco', label: 'Endereço completo', group: 'Contato', gen: (o) => endereco(o.uf).completo, text: true },
    { id: 'renavam', label: 'RENAVAM', group: 'Veículo', gen: () => renavam() },
    { id: 'placa', label: 'Placa antiga', group: 'Veículo', gen: () => placa() },
    { id: 'placaMercosul', label: 'Placa Mercosul', group: 'Veículo', gen: () => placaMercosul() },
    { id: 'chassi', label: 'Chassi', group: 'Veículo', gen: () => chassi() },
    { id: 'cartao', label: 'Cartão de crédito', group: 'Financeiro', gen: () => cartao().numero },
    { id: 'cnm', label: 'Matrícula de imóvel (CNM)', group: 'Imóvel', gen: () => matriculaCnm() },
    { id: 'iptu', label: 'Inscrição IPTU', group: 'Imóvel', gen: () => inscricaoIptu() },
  ];

  function generate(id, { mask = true, uf } = {}) {
    const t = TYPES.find((x) => x.id === id);
    if (!t) throw new Error(`Tipo desconhecido: ${id}`);
    const v = t.gen({ uf: normUf(uf) });
    return mask || t.text ? v : unmask(v);
  }

  // Perfil completo e coerente usado no preenchimento automático de formulários.
  function profile(uf) {
    const p = pessoa(uf);
    const e = empresa(p.endereco.uf);
    const card = cartao(null, p.nome);
    const conta = contaBancaria();
    const v = veiculo(p.endereco.uf);
    const { endereco: end, ...pf } = p;
    return {
      ...pf,
      logradouro: end.logradouro, numero: end.numero, complemento: end.complemento, bairro: end.bairro,
      cidade: end.cidade, uf: end.uf, estado: end.estado, cep: end.cep, pais: 'Brasil',
      cnpj: e.cnpj, inscricaoEstadual: e.inscricaoEstadual, razaoSocial: e.razaoSocial, nomeFantasia: e.nomeFantasia,
      site: e.site,
      cartaoNumero: card.numero, cartaoNome: card.nome, cartaoValidade: card.validade, cartaoValidadeIso: card.validadeIso,
      cartaoCvv: card.cvv, cartaoBandeira: card.bandeira,
      banco: conta.banco, bancoCodigo: conta.codigo, agencia: conta.agencia, conta: conta.conta,
      renavam: v.renavam, placa: v.placaMercosul, chassi: v.chassi,
    };
  }

  // Campos do perfil que são documentos/códigos e podem perder a máscara.
  const MASKABLE = [
    'cpf', 'rg', 'cnh', 'pis', 'cns', 'titulo', 'cnpj', 'inscricaoEstadual', 'celular', 'telefone', 'cep',
    'cartaoNumero', 'agencia', 'conta', 'nascimento', 'cartaoValidade',
  ];

  root.FakeData = {
    UFS, STATES: D.states, BANKS: D.banks, CARD_BRANDS, TYPES, MASKABLE,
    unmask, generate, profile, pessoa, empresa, veiculo, imovel, cartao, contaBancaria, endereco,
    cpf, rg, cnh, pis, cns, tituloEleitor, passaporte, nome, email, birthDate, celular, telefone, cep,
    cnpj, cnpjAlfanumerico, inscricaoEstadual, razaoSocial, renavam, placa, placaMercosul, chassi,
    matriculaCnm, inscricaoIptu,
  };
})(globalThis);
