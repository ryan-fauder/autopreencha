/**
 * Padrão Registry: catálogo dos tipos de valor único. É a fonte única para o menu de contexto e para a
 * aba "Gerador" do popup — para oferecer um tipo novo nos dois lugares, basta registrá-lo aqui.
 */
import { TIPOS_SANGUINEOS } from '../data/people.js';
import { cnpj, cnpjAlfanumerico } from './documents/company.js';
import { inscricaoEstadual } from './documents/inscricao-estadual.js';
import { cnh, cns, cpf, passaporte, pis, rg, tituloEleitor } from './documents/person.js';
import { razaoSocial } from './factories.js';
import { cartao } from './finance.js';
import { address, celular, cep, dddOf, normalizeUf, telefone } from './geo.js';
import { birthDate, email, fullName } from './people.js';
import { inscricaoIptu, matriculaCnm } from './property.js';
import { pick } from './random.js';
import { unmask } from './text.js';
import { chassi, placa, placaMercosul, renavam } from './vehicle.js';

export const GROUPS = ['Pessoa', 'Empresa', 'Contato', 'Veículo', 'Financeiro', 'Imóvel'];

/**
 * id: chave estável (usada nos menus e no armazenamento) · text: valor livre, nunca perde a "máscara".
 * create({ uf }) devolve o valor sempre com máscara; generate() a remove quando pedido.
 */
export const VALUE_TYPES = [
  { id: 'cpf', label: 'CPF', group: 'Pessoa', create: ({ uf }) => cpf(uf) },
  { id: 'rg', label: 'RG', group: 'Pessoa', create: () => rg() },
  { id: 'cnh', label: 'CNH', group: 'Pessoa', create: () => cnh() },
  { id: 'pis', label: 'PIS/PASEP', group: 'Pessoa', create: () => pis() },
  { id: 'cns', label: 'CNS (Cartão SUS)', group: 'Pessoa', create: () => cns() },
  { id: 'titulo', label: 'Título de Eleitor', group: 'Pessoa', create: ({ uf }) => tituloEleitor(uf) },
  { id: 'passaporte', label: 'Passaporte', group: 'Pessoa', create: () => passaporte() },
  { id: 'nome', label: 'Nome completo', group: 'Pessoa', create: () => fullName(), text: true },
  { id: 'nascimento', label: 'Data de nascimento', group: 'Pessoa', create: () => birthDate().br },
  { id: 'email', label: 'E-mail', group: 'Pessoa', create: () => email(), text: true },
  { id: 'tipoSanguineo', label: 'Tipo sanguíneo', group: 'Pessoa', create: () => pick(TIPOS_SANGUINEOS), text: true },
  { id: 'cnpj', label: 'CNPJ', group: 'Empresa', create: () => cnpj() },
  { id: 'cnpjAlfa', label: 'CNPJ alfanumérico', group: 'Empresa', create: () => cnpjAlfanumerico() },
  { id: 'ie', label: 'Inscrição Estadual', group: 'Empresa', create: ({ uf }) => inscricaoEstadual(uf) },
  { id: 'razaoSocial', label: 'Razão social', group: 'Empresa', create: () => razaoSocial(), text: true },
  { id: 'celular', label: 'Celular', group: 'Contato', create: ({ uf }) => celular(dddOf(uf)) },
  { id: 'telefone', label: 'Telefone fixo', group: 'Contato', create: ({ uf }) => telefone(dddOf(uf)) },
  { id: 'cep', label: 'CEP', group: 'Contato', create: ({ uf }) => cep(uf) },
  { id: 'endereco', label: 'Endereço completo', group: 'Contato', create: ({ uf }) => address(uf).completo, text: true },
  { id: 'renavam', label: 'RENAVAM', group: 'Veículo', create: () => renavam() },
  { id: 'placa', label: 'Placa antiga', group: 'Veículo', create: () => placa() },
  { id: 'placaMercosul', label: 'Placa Mercosul', group: 'Veículo', create: () => placaMercosul() },
  { id: 'chassi', label: 'Chassi', group: 'Veículo', create: () => chassi() },
  { id: 'cartao', label: 'Cartão de crédito', group: 'Financeiro', create: () => cartao().numero },
  { id: 'cnm', label: 'Matrícula de imóvel (CNM)', group: 'Imóvel', create: () => matriculaCnm() },
  { id: 'iptu', label: 'Inscrição IPTU', group: 'Imóvel', create: () => inscricaoIptu() },
];

const BY_ID = new Map(VALUE_TYPES.map((t) => [t.id, t]));

export const findValueType = (id) => BY_ID.get(id);

/** Gera um valor do tipo `id`, com ou sem máscara, coerente com a UF quando o tipo depende dela. */
export function generate(id, { mask = true, uf } = {}) {
  const type = BY_ID.get(id);
  if (!type) throw new Error(`Tipo desconhecido: ${id}`);
  const value = type.create({ uf: normalizeUf(uf) });
  return mask || type.text ? value : unmask(value);
}
