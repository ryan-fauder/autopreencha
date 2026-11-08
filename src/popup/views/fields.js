/**
 * O que cada aba mostra, de forma declarativa: [rótulo, valor, mascarável?].
 * Para exibir um campo novo, basta acrescentá-lo aqui — a renderização é genérica.
 */

const addressFields = (e) => [
  ['CEP', e.cep, true], ['Logradouro', e.logradouro], ['Número', e.numero], ['Complemento', e.complemento],
  ['Bairro', e.bairro], ['Cidade', e.cidade], ['Estado', `${e.estado} (${e.uf})`], ['Endereço completo', e.completo],
];

export const ENTITY_FIELDS = {
  pessoa: (p) => [
    ['Nome', p.nome], ['Sexo', p.sexo], ['Nascimento', p.nascimento, true], ['Idade', `${p.idade} anos`],
    ['Mãe', p.mae], ['Pai', p.pai],
    ['CPF', p.cpf, true], ['RG', p.rg, true], ['Órgão emissor', p.orgaoEmissor],
    ['CNH', p.cnh], ['Categoria CNH', p.categoriaCnh], ['PIS/PASEP', p.pis, true], ['CNS', p.cns, true],
    ['Título de eleitor', p.titulo, true], ['Passaporte', p.passaporte],
    ['E-mail', p.email], ['Celular', p.celular, true], ['Telefone', p.telefone, true],
    ['Usuário', p.usuario], ['Senha', p.senha],
    ['Estado civil', p.estadoCivil], ['Profissão', p.profissao],
    ['Cor/Raça', p.racaCor], ['Orientação sexual', p.orientacaoSexual], ['Identidade de gênero', p.identidadeGenero],
    ['Tipo sanguíneo', p.tipoSanguineo], ['Altura', p.altura], ['Peso', p.peso],
    ...addressFields(p.endereco),
  ],
  empresa: (e) => [
    ['Razão social', e.razaoSocial], ['Nome fantasia', e.nomeFantasia],
    ['CNPJ', e.cnpj, true], ['CNPJ alfanumérico', e.cnpjAlfanumerico, true],
    ['Inscrição estadual', e.inscricaoEstadual, true], ['Inscrição municipal', e.inscricaoMunicipal],
    ['Data de abertura', e.dataAbertura, true], ['E-mail', e.email], ['Site', e.site],
    ['Telefone', e.telefone, true], ['Celular', e.celular, true],
    ...addressFields(e.endereco),
  ],
  conta: (c) => [
    ['Banco', c.banco], ['Código', c.codigo], ['Agência', c.agencia, true], ['Conta', c.conta, true], ['Tipo', c.tipo],
  ],
  cartao: (c) => [
    ['Bandeira', c.bandeira], ['Número', c.numero, true], ['Nome impresso', c.nome],
    ['Validade', c.validade, true], ['CVV', c.cvv],
  ],
  veiculo: (v) => [
    ['Marca', v.marca], ['Modelo', v.modelo], ['Ano fab./modelo', `${v.anoFabricacao}/${v.anoModelo}`],
    ['Cor', v.cor], ['Combustível', v.combustivel], ['Placa Mercosul', v.placaMercosul],
    ['Placa antiga', v.placa, true], ['RENAVAM', v.renavam], ['Chassi', v.chassi], ['UF', v.uf],
  ],
  imovel: (i) => [
    ['Tipo', i.tipo], ['Finalidade', i.finalidade], ['Área total', i.areaTotal], ['Área útil', i.areaUtil],
    ['Quartos', i.quartos], ['Suítes', i.suites], ['Banheiros', i.banheiros], ['Vagas', i.vagas],
    ['Ano de construção', i.anoConstrucao], ['Valor de venda', i.valorVenda], ['Aluguel', i.valorAluguel],
    ['Condomínio', i.condominio], ['IPTU anual', i.iptuAnual], ['Inscrição IPTU', i.inscricaoIptu, true],
    ['Cartório', i.cartorio], ['CNS do cartório', i.cnsCartorio], ['Matrícula', i.matricula],
    ['CNM', i.cnm, true], ['Proprietário', i.proprietario], ['CPF proprietário', i.cpfProprietario, true],
    ...addressFields(i.endereco),
  ],
};
