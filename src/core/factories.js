/**
 * Padrão Factory: monta entidades completas e coerentes entre si (mesma UF no endereço, DDD, CPF e
 * título; nome do titular no cartão etc.) a partir dos geradores atômicos.
 */
import { ACTIVITIES, FANTASY_WORDS, SUFFIXES } from '../data/companies.js';
import {
  CATEGORIAS_CNH, ESTADO_CIVIL, FEMALE_NAMES, IDENTIDADE_GENERO, MALE_NAMES, ORIENTACAO_SEXUAL, PROFISSOES,
  RACA_COR, SURNAMES, TIPOS_SANGUINEOS,
} from '../data/people.js';
import { PROPERTY_TYPES } from '../data/property.js';
import { COLORS, FUELS, VEHICLES } from '../data/vehicles.js';
import { cnpj, cnpjAlfanumerico } from './documents/company.js';
import { inscricaoEstadual } from './documents/inscricao-estadual.js';
import { cnh, cns, cpf, passaporte, pis, rg, tituloEleitor } from './documents/person.js';
import { cartao, contaBancaria } from './finance.js';
import { address, celular, normalizeUf, randomUf, telefone } from './geo.js';
import { birthDate, email, firstName, fullName, SEXOS } from './people.js';
import { inscricaoIptu, matriculaCnm } from './property.js';
import { digits, pick, pickOther, rand } from './random.js';
import { money, pad, slug } from './text.js';
import { chassi, placa, placaMercosul, renavam } from './vehicle.js';

export function createPessoa(uf) {
  const sexo = pick(SEXOS);
  const first = firstName(sexo);
  // Convenção brasileira: sobrenome da mãe seguido do sobrenome do pai.
  const sobMae = pick(SURNAMES);
  const sobPai = pickOther(SURNAMES, sobMae);
  const nome = `${first} ${sobMae} ${sobPai}`;
  const nasc = birthDate(18, 80);
  const endereco = address(uf);
  return {
    nome,
    primeiroNome: first,
    sobrenome: `${sobMae} ${sobPai}`,
    sexo,
    nascimento: nasc.br,
    nascimentoIso: nasc.iso,
    idade: String(nasc.age),
    mae: `${pick(FEMALE_NAMES)} ${pickOther(SURNAMES, sobMae)} ${sobMae}`,
    pai: `${pick(MALE_NAMES)} ${pickOther(SURNAMES, sobPai)} ${sobPai}`,
    cpf: cpf(endereco.uf),
    rg: rg(),
    orgaoEmissor: `SSP/${endereco.uf}`,
    cnh: cnh(),
    categoriaCnh: pick(CATEGORIAS_CNH),
    pis: pis(),
    cns: cns(),
    titulo: tituloEleitor(endereco.uf),
    passaporte: passaporte(),
    email: email(nome),
    usuario: `${slug(first)}.${slug(sobPai)}${rand(1, 99)}`,
    senha: `${first[0].toUpperCase()}${slug(sobPai).slice(0, 4)}@${rand(1000, 9999)}`,
    celular: celular(endereco.ddd),
    telefone: telefone(endereco.ddd),
    estadoCivil: pick(ESTADO_CIVIL),
    profissao: pick(PROFISSOES),
    racaCor: pick(RACA_COR),
    orientacaoSexual: pick(ORIENTACAO_SEXUAL),
    identidadeGenero: pick(IDENTIDADE_GENERO),
    tipoSanguineo: pick(TIPOS_SANGUINEOS),
    altura: `${(rand(150, 195) / 100).toFixed(2).replace('.', ',')} m`,
    peso: `${rand(50, 110)} kg`,
    endereco,
  };
}

export const razaoSocial = () => `${pick(SURNAMES)} ${pick(ACTIVITIES)} ${pick(SUFFIXES)}`;

export function createEmpresa(uf) {
  const endereco = address(uf);
  const fantasia = `${pick(FANTASY_WORDS)} ${pick(ACTIVITIES).split(' ')[0]}`;
  const domain = `${slug(fantasia)}.com.br`;
  return {
    razaoSocial: `${fantasia} ${pick(SUFFIXES)}`,
    nomeFantasia: fantasia,
    cnpj: cnpj(),
    cnpjAlfanumerico: cnpjAlfanumerico(),
    inscricaoEstadual: inscricaoEstadual(endereco.uf),
    inscricaoMunicipal: digits(8).join(''),
    dataAbertura: birthDate(1, 40).br,
    email: `contato@${domain}`,
    site: `https://www.${domain}`,
    telefone: telefone(endereco.ddd),
    celular: celular(endereco.ddd),
    endereco,
  };
}

export function createVeiculo(uf, today = new Date()) {
  const v = pick(VEHICLES);
  const anoFab = rand(2008, today.getFullYear());
  return {
    marca: v.brand,
    modelo: pick(v.models),
    anoFabricacao: String(anoFab),
    anoModelo: String(anoFab + rand(0, 1)),
    cor: pick(COLORS),
    combustivel: pick(FUELS),
    placa: placa(),
    placaMercosul: placaMercosul(),
    renavam: renavam(),
    chassi: chassi(v.wmi),
    uf: normalizeUf(uf) || randomUf(),
  };
}

const PRICE_PER_M2 = { Terreno: [400, 3000], Galpão: [1500, 4000] };

export function createImovel(uf, today = new Date()) {
  const t = pick(PROPERTY_TYPES);
  const endereco = address(uf);
  const area = rand(t.areaMin, t.areaMax);
  const [pMin, pMax] = PRICE_PER_M2[t.type] || [3500, 12000];
  const venda = Math.round((area * rand(pMin, pMax)) / 1000) * 1000;
  const quartos = rand(t.roomsMin, t.roomsMax);
  const terreno = t.type === 'Terreno';
  const cnsCartorio = pad(rand(100000, 199999), 6);
  const numMatricula = rand(1, 250000);
  return {
    tipo: t.type,
    finalidade: pick(['Venda', 'Locação', 'Venda e locação']),
    endereco,
    areaTotal: `${area} m²`,
    areaUtil: `${terreno ? area : Math.round((area * rand(75, 95)) / 100)} m²`,
    quartos: String(quartos),
    suites: String(quartos ? rand(0, Math.min(quartos, 3)) : 0),
    banheiros: String(terreno ? 0 : Math.max(1, quartos ? rand(1, quartos + 1) : rand(1, 4))),
    vagas: String(rand(t.parkingMax ? 1 : 0, t.parkingMax)),
    anoConstrucao: terreno ? '-' : String(rand(1970, today.getFullYear() - 1)),
    valorVenda: money(venda),
    valorAluguel: money(Math.round((venda * rand(35, 60)) / 100000) * 10),
    condominio: t.condo ? money(rand(25, 160) * 10) : 'Não possui',
    iptuAnual: money(Math.round((venda * rand(4, 12)) / 1000)),
    inscricaoIptu: inscricaoIptu(),
    cartorio: `${rand(1, 9)}º Ofício de Registro de Imóveis de ${endereco.cidade}`,
    cnsCartorio,
    matricula: numMatricula.toLocaleString('pt-BR'),
    cnm: matriculaCnm(cnsCartorio, numMatricula),
    proprietario: fullName(),
    cpfProprietario: cpf(endereco.uf),
  };
}

export const createCartao = (brandKey, holderName) => cartao(brandKey, holderName);
export const createContaBancaria = (bankCode) => contaBancaria(bankCode);

/** Campos do perfil de formulário que são documentos/códigos e podem perder a máscara. */
export const PROFILE_MASKABLE_KEYS = [
  'cpf', 'rg', 'cnh', 'pis', 'cns', 'titulo', 'cnpj', 'inscricaoEstadual', 'celular', 'telefone', 'cep',
  'cartaoNumero', 'agencia', 'conta', 'nascimento', 'cartaoValidade',
];

/**
 * Perfil "achatado" para o preenchimento de formulários: uma única pessoa e tudo o que se liga a ela,
 * com as chaves que as regras de content/field-rules.js reconhecem.
 */
export function createFormProfile(uf) {
  const { endereco: end, ...pessoa } = createPessoa(uf);
  const empresa = createEmpresa(end.uf);
  const card = cartao(null, pessoa.nome);
  const conta = contaBancaria();
  const veiculo = createVeiculo(end.uf);
  return {
    ...pessoa,
    logradouro: end.logradouro, numero: end.numero, complemento: end.complemento, bairro: end.bairro,
    cidade: end.cidade, uf: end.uf, estado: end.estado, cep: end.cep, pais: 'Brasil',
    cnpj: empresa.cnpj, inscricaoEstadual: empresa.inscricaoEstadual, razaoSocial: empresa.razaoSocial,
    nomeFantasia: empresa.nomeFantasia, site: empresa.site,
    cartaoNumero: card.numero, cartaoNome: card.nome, cartaoValidade: card.validade,
    cartaoValidadeIso: card.validadeIso, cartaoCvv: card.cvv, cartaoBandeira: card.bandeira,
    banco: conta.banco, bancoCodigo: conta.codigo, agencia: conta.agencia, conta: conta.conta,
    renavam: veiculo.renavam, placa: veiculo.placaMercosul, chassi: veiculo.chassi,
  };
}
