/** Formatação de texto: máscaras, acentos e valores monetários. */

export const pad = (value, length) => String(value).padStart(length, '0');

/** Preenche cada `#` da máscara com o próximo caractere de `value`. */
export function applyMask(value, mask) {
  let i = 0;
  return mask.replace(/#/g, () => value[i++] ?? '');
}

/** Remove pontuação e espaços, mantendo letras e dígitos (CNPJ alfanumérico, RG com X, placas). */
export const unmask = (value) => String(value).replace(/[^0-9A-Za-z]/g, '');

export const stripAccents = (text) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '');

export const slug = (text) => stripAccents(text).toLowerCase().replace(/[^a-z0-9]+/g, '');

export const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
