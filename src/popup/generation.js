/**
 * Geração sob demanda: completa só o que falta no estado (valores do Gerador e entidades das abas).
 * Função pura sobre os dados; devolve o mesmo objeto quando nada precisou ser gerado.
 */
import {
  createCartao, createContaBancaria, createEmpresa, createImovel, createPessoa, createVeiculo,
} from '../core/factories.js';
import { VALUE_TYPES, generate } from '../core/registry.js';

// A ordem importa: o cartão usa o nome da pessoa já gerada.
const ENTITY_FACTORIES = {
  pessoa: ({ settings }) => createPessoa(settings.uf),
  empresa: ({ settings }) => createEmpresa(settings.uf),
  conta: ({ ui }) => createContaBancaria(ui.bank),
  cartao: ({ ui, data }) => createCartao(ui.brand, data.pessoa?.nome),
  veiculo: ({ settings }) => createVeiculo(settings.uf),
  imovel: ({ settings }) => createImovel(settings.uf),
};

export const ENTITY_KEYS = Object.keys(ENTITY_FACTORIES);

export const emptyData = () => ({ quick: {} });

export function ensureGenerated({ data, settings, ui }) {
  const next = { ...data, quick: { ...data.quick } };
  let changed = false;
  for (const type of VALUE_TYPES) {
    if (!next.quick[type.id]) {
      next.quick[type.id] = generate(type.id, { uf: settings.uf });
      changed = true;
    }
  }
  for (const [key, factory] of Object.entries(ENTITY_FACTORIES)) {
    if (!next[key]) {
      next[key] = factory({ settings, ui, data: next });
      changed = true;
    }
  }
  return changed ? next : data;
}
