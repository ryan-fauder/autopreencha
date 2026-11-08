/**
 * Regras para reconhecer campos de formulário. Só dados: o motor (fill-form.js) as recebe como argumento
 * serializável, então ajustar uma regra não exige mexer no código injetado.
 *
 * A ordem é a prioridade — a primeira regra que casar vence. Os textos comparados já chegam
 * normalizados: sem acentos, minúsculos, camelCase e _-.[] viram espaços.
 */
const B = (word) => `(^|[^a-z])(${word})([^a-z]|$)`; // palavra inteira

/** [chave do perfil, fonte da expressão regular] — fontes em texto para atravessar o executeScript. */
export const FIELD_RULES = [
  ['senha', `senha|password|passwd|${B('pass')}`],
  ['usuario', 'user ?name|usuario|login|apelido|nickname'],
  ['email', 'e-? ?mail'],
  ['cpf', 'cpf'],
  ['cnpj', 'cnpj'],
  ['inscricaoEstadual', `inscricao ?estadual|insc ?est|${B('ie')}`],
  ['identidadeGenero', 'identidade ?(de )?genero|gender ?identity'],
  ['orientacaoSexual', 'orientacao|sexual ?orientation'],
  ['racaCor', `raca|etnia|race|ethnic|${B('cor')}`],
  ['tipoSanguineo', 'sangu|blood'],
  ['rg', `${B('rg')}|identidade|registro ?geral`],
  ['orgaoEmissor', 'orgao|emissor|expedidor'],
  ['cnh', 'cnh|habilitacao|driver'],
  ['pis', `${B('pis|nis|nit')}|pasep`],
  ['cns', `cns|cartao ?(do )?sus|${B('sus')}`],
  ['titulo', 'titulo|eleitor'],
  ['passaporte', 'passaporte|passport'],
  ['renavam', 'renavam'],
  ['placa', 'placa|license ?plate'],
  ['chassi', `chassi|${B('vin')}`],
  ['cartaoNome', 'nome ?(impresso|no ?cartao|do ?titular)|card ?holder|holder|cc ?name'],
  ['cartaoCvv', 'cvv|cvc|csc|codigo ?(de )?seguranca|security ?code'],
  ['cartaoValidade', `validade|vencimento|expir|exp ?date|${B('exp')}`],
  ['cartaoNumero', 'cartao|card ?num|cc ?num|credit'],
  ['agencia', 'agencia|agency|branch'],
  ['conta', `${B('conta')}|account ?(number|num)`],
  ['banco', 'banco|bank'],
  ['mae', `${B('mae')}|mother`],
  ['pai', `${B('pai')}|father`],
  ['razaoSocial', 'razao|company|empresa|corporate|organization'],
  ['nomeFantasia', 'fantasia|trade ?name'],
  ['sobrenome', 'sobrenome|last ?name|surname|family ?name'],
  ['primeiroNome', 'primeiro ?nome|first ?name|given ?name|prenome'],
  ['nascimento', 'nasc|birth|bday|aniversario'],
  ['idade', B('idade|age')],
  ['estadoCivil', 'estado ?civil|marital'],
  ['sexo', `sexo|${B('sex')}|genero|gender`],
  ['profissao', 'profissao|ocupacao|cargo|occupation|job'],
  ['celular', `celular|mobile|${B('cel')}|whats`],
  ['telefone', `telefone|phone|fone|${B('tel')}`],
  ['cep', `${B('cep')}|zip|postal`],
  ['complemento', 'complemento|complement|address ?line ?2|apto'],
  ['numero', `numero|${B('num|nro|no')}|number`],
  ['bairro', 'bairro|district|neighbo'],
  ['cidade', 'cidade|municipio|city|town'],
  ['uf', `${B('uf')}|estado|state|province`],
  ['logradouro', `logradouro|endereco|address|${B('rua')}|street`],
  ['pais', 'pais|country'],
  ['site', 'site|url|homepage'],
  ['nome', 'nome|name'],
];

/** Atributo HTML autocomplete → chave do perfil. Tem prioridade sobre as regras por texto. */
export const AUTOCOMPLETE_KEYS = {
  'given-name': 'primeiroNome', 'family-name': 'sobrenome', name: 'nome', email: 'email',
  tel: 'celular', 'tel-national': 'celular', 'postal-code': 'cep', 'street-address': 'logradouro',
  'address-line1': 'logradouro', 'address-line2': 'complemento', 'address-level2': 'cidade',
  'address-level1': 'uf', bday: 'nascimento', sex: 'sexo', 'cc-number': 'cartaoNumero',
  'cc-name': 'cartaoNome', 'cc-exp': 'cartaoValidade', 'cc-csc': 'cartaoCvv', username: 'usuario',
  'new-password': 'senha', 'current-password': 'senha', organization: 'razaoSocial',
  country: 'pais', 'country-name': 'pais', url: 'site',
};
