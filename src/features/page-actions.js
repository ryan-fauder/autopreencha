/**
 * Casos de uso que atuam na página aberta. Usados tanto pelo background (menu, atalho) quanto pelo popup,
 * para que a regra exista em um único lugar.
 */
import { fillForm } from '../content/fill-form.js';
import { AUTOCOMPLETE_KEYS, FIELD_RULES } from '../content/field-rules.js';
import { insertValue } from '../content/insert-value.js';
import { createFormProfile, PROFILE_MASKABLE_KEYS } from '../core/factories.js';
import { runInPage } from '../platform/browser-page.js';

/** Preenche todos os campos reconhecidos com uma mesma pessoa fictícia. Retorna quantos foram preenchidos. */
export async function fillPage(tabId, { mask, uf }) {
  const options = { maskableKeys: PROFILE_MASKABLE_KEYS, useMask: mask, rules: FIELD_RULES, autocomplete: AUTOCOMPLETE_KEYS };
  const counts = await runInPage(tabId, fillForm, [createFormProfile(uf), options]);
  return counts.reduce((total, n) => total + (n || 0), 0);
}

/** Insere o valor no campo focado. Retorna true se algum frame tinha um campo para receber. */
export async function insertIntoPage(tabId, value, frameId) {
  const results = await runInPage(tabId, insertValue, [value], { frameId });
  return results.some(Boolean);
}
