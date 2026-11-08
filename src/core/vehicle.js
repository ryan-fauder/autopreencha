/** Veículos: RENAVAM, placas e chassi. */
import { VEHICLES } from '../data/vehicles.js';
import { allEqual, mod11Times10 } from './checksum.js';
import { digits, letter, pick, rand } from './random.js';

export function renavam() {
  let b;
  do { b = digits(10); } while (allEqual(b));
  return b.join('') + mod11Times10(b, [3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
}

/** No padrão antigo só foram emitidas as séries até SAV (SAW0001–ZZZ9999 não existem). */
export function placa() {
  let letters;
  do { letters = `${letter()}${letter()}${letter()}`; } while (letters >= 'SAW');
  return `${letters}-${digits(4).join('')}`;
}

export const placaMercosul = () => `${letter()}${letter()}${letter()}${rand(0, 9)}${letter()}${digits(2).join('')}`;

/** 17 caracteres sem I, O e Q; os 3 primeiros identificam o fabricante (WMI). */
export function chassi(wmi = pick(VEHICLES).wmi) {
  const VIN = [...'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'];
  return wmi + Array.from({ length: 14 }, () => pick(VIN)).join('');
}
