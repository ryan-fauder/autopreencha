/** Marcas (com WMI, os 3 primeiros caracteres do chassi), modelos, cores e combustíveis. */

export const VEHICLES = [
  ['Volkswagen', '9BW', ['Gol', 'Polo', 'Virtus', 'T-Cross', 'Nivus', 'Saveiro']],
  ['Fiat', '9BD', ['Uno', 'Argo', 'Mobi', 'Strada', 'Toro', 'Pulse', 'Cronos']],
  ['Chevrolet', '9BG', ['Onix', 'Onix Plus', 'Tracker', 'S10', 'Spin', 'Montana']],
  ['Ford', '9BF', ['Ka', 'Ranger', 'EcoSport', 'Fiesta']],
  ['Hyundai', '9BH', ['HB20', 'HB20S', 'Creta']],
  ['Toyota', '9BR', ['Corolla', 'Corolla Cross', 'Yaris', 'Hilux', 'Etios']],
  ['Honda', '93H', ['Civic', 'City', 'HR-V', 'Fit', 'WR-V']],
  ['Renault', '93Y', ['Kwid', 'Sandero', 'Logan', 'Duster', 'Oroch']],
  ['Jeep', '988', ['Renegade', 'Compass', 'Commander']],
].map(([brand, wmi, models]) => ({ brand, wmi, models }));

export const COLORS = ['Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Marrom', 'Verde', 'Bege'];
export const FUELS = ['Flex', 'Flex', 'Flex', 'Gasolina', 'Diesel', 'Elétrico', 'Híbrido'];
