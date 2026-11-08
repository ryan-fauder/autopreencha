/** Tipos de imóvel e suas faixas plausíveis de área, cômodos e vagas. */

// [tipo, área mín, área máx, quartos mín, quartos máx, vagas máx, tem condomínio]
export const PROPERTY_TYPES = [
  ['Apartamento', 40, 180, 1, 4, 3, true], ['Casa', 70, 400, 1, 5, 4, false],
  ['Casa em condomínio', 120, 450, 2, 5, 4, true], ['Cobertura', 120, 400, 2, 5, 4, true],
  ['Sala comercial', 25, 150, 0, 0, 2, true], ['Loja', 40, 300, 0, 0, 3, false],
  ['Terreno', 150, 1000, 0, 0, 0, false], ['Galpão', 300, 3000, 0, 0, 10, false],
].map(([type, areaMin, areaMax, roomsMin, roomsMax, parkingMax, condo]) =>
  ({ type, areaMin, areaMax, roomsMin, roomsMax, parkingMax, condo }));
