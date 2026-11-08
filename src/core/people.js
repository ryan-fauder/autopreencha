/** Nomes, e-mails e datas de nascimento. */
import { EMAIL_DOMAINS, FEMALE_NAMES, MALE_NAMES, SURNAMES } from '../data/people.js';
import { pick, pickOther, rand, random } from './random.js';
import { pad, stripAccents } from './text.js';

export const SEXOS = ['Masculino', 'Feminino'];

export const firstName = (sexo) => pick(sexo === 'Masculino' ? MALE_NAMES : FEMALE_NAMES);

export function fullName(sexo = pick(SEXOS)) {
  const s1 = pick(SURNAMES);
  return `${firstName(sexo)} ${s1} ${pickOther(SURNAMES, s1)}`;
}

export function email(name = fullName()) {
  const parts = stripAccents(name).toLowerCase().split(/\s+/);
  const first = parts[0];
  const last = parts[parts.length - 1];
  const user = pick([
    `${first}.${last}`, `${first}${last}`, `${first}_${last}`, `${first}.${last}${rand(1, 99)}`,
    `${first[0]}${last}${rand(10, 999)}`, `${first}${rand(1970, 2005)}`,
  ]);
  return `${user}@${pick(EMAIL_DOMAINS)}`;
}

/**
 * Data de nascimento cuja idade hoje fica em [minAge, maxAge].
 * Sorteia entre a data mais antiga e a mais recente possíveis, para a idade nunca escapar da faixa.
 */
export function birthDate(minAge = 18, maxAge = 80, today = new Date()) {
  const latest = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const earliest = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate() + 1);
  const date = new Date(earliest.getTime() + random() * (latest.getTime() - earliest.getTime()));
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return { br: `${pad(d, 2)}/${pad(m, 2)}/${y}`, iso: `${y}-${pad(m, 2)}-${pad(d, 2)}`, age };
}
