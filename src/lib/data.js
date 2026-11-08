/* Bases de dados usadas pelos geradores. Tudo é fictício/público. */
(function (root) {
  'use strict';

  const maleNames = [
    'Miguel', 'Arthur', 'Gael', 'Heitor', 'Theo', 'Davi', 'Gabriel', 'Bernardo', 'Samuel', 'João',
    'Pedro', 'Lucas', 'Rafael', 'Gustavo', 'Matheus', 'Enzo', 'Lorenzo', 'Benjamin', 'Nicolas', 'Guilherme',
    'Felipe', 'Bruno', 'Thiago', 'Rodrigo', 'Eduardo', 'Leonardo', 'Daniel', 'Vinícius', 'Caio', 'Henrique',
    'Marcelo', 'Ricardo', 'Fernando', 'André', 'Paulo', 'Carlos', 'José', 'Antônio', 'Luiz', 'Francisco',
    'Murilo', 'Otávio', 'Vitor', 'Igor', 'Diego', 'Fábio', 'Renato', 'Sérgio', 'Wagner', 'Alexandre',
  ];

  const femaleNames = [
    'Helena', 'Alice', 'Laura', 'Maria', 'Valentina', 'Heloísa', 'Cecília', 'Manuela', 'Sophia', 'Isabella',
    'Júlia', 'Lívia', 'Beatriz', 'Mariana', 'Gabriela', 'Larissa', 'Fernanda', 'Camila', 'Amanda', 'Letícia',
    'Ana', 'Juliana', 'Patrícia', 'Aline', 'Bruna', 'Carolina', 'Vanessa', 'Renata', 'Daniela', 'Tatiane',
    'Luana', 'Bianca', 'Natália', 'Priscila', 'Rafaela', 'Isadora', 'Lorena', 'Clara', 'Yasmin', 'Eduarda',
    'Francisca', 'Antônia', 'Adriana', 'Simone', 'Sandra', 'Cláudia', 'Márcia', 'Luciana', 'Rosângela', 'Débora',
  ];

  const surnames = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
    'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
    'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas',
    'Cardoso', 'Ramos', 'Gonçalves', 'Santana', 'Teixeira', 'Araújo', 'Pinto', 'Correia', 'Cavalcanti', 'Monteiro',
    'Moura', 'Campos', 'Batista', 'Castro', 'Rezende', 'Farias', 'Azevedo', 'Melo', 'Barros', 'Cunha',
    'Duarte', 'Pires', 'Nogueira', 'Medeiros', 'Peixoto', 'Fonseca', 'Siqueira', 'Brandão', 'Xavier', 'Bezerra',
  ];

  // [cidade, UF, DDD, CEP inicial, CEP final]
  const cities = [
    ['São Paulo', 'SP', '11', 1000000, 5999999], ['Campinas', 'SP', '19', 13000000, 13139999],
    ['Ribeirão Preto', 'SP', '16', 14000000, 14109999], ['Rio de Janeiro', 'RJ', '21', 20000000, 23799999],
    ['Niterói', 'RJ', '21', 24000000, 24399999], ['Belo Horizonte', 'MG', '31', 30000000, 31999999],
    ['Uberlândia', 'MG', '34', 38400000, 38415999], ['Vitória', 'ES', '27', 29000000, 29099999],
    ['Curitiba', 'PR', '41', 80000000, 82999999], ['Londrina', 'PR', '43', 86000000, 86099999],
    ['Florianópolis', 'SC', '48', 88000000, 88099999], ['Joinville', 'SC', '47', 89200000, 89239999],
    ['Porto Alegre', 'RS', '51', 90000000, 91999999], ['Caxias do Sul', 'RS', '54', 95000000, 95124999],
    ['Salvador', 'BA', '71', 40000000, 42599999], ['Aracaju', 'SE', '79', 49000000, 49099999],
    ['Maceió', 'AL', '82', 57000000, 57099999], ['Recife', 'PE', '81', 50000000, 52999999],
    ['João Pessoa', 'PB', '83', 58000000, 58099999], ['Natal', 'RN', '84', 59000000, 59139999],
    ['Fortaleza', 'CE', '85', 60000000, 61599999], ['Teresina', 'PI', '86', 64000000, 64099999],
    ['São Luís', 'MA', '98', 65000000, 65109999], ['Belém', 'PA', '91', 66000000, 66999999],
    ['Macapá', 'AP', '96', 68900000, 68914999], ['Manaus', 'AM', '92', 69000000, 69099999],
    ['Boa Vista', 'RR', '95', 69300000, 69339999], ['Rio Branco', 'AC', '68', 69900000, 69924999],
    ['Porto Velho', 'RO', '69', 76800000, 76834999], ['Palmas', 'TO', '63', 77000000, 77249999],
    ['Cuiabá', 'MT', '65', 78000000, 78109999], ['Campo Grande', 'MS', '67', 79000000, 79129999],
    ['Goiânia', 'GO', '62', 74000000, 74899999], ['Brasília', 'DF', '61', 70000000, 72799999],
  ].map(([city, uf, ddd, cepMin, cepMax]) => ({ city, uf, ddd, cepMin, cepMax }));

  const states = {
    AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
    ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
    MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
    RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
    SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
  };

  const streetTypes = ['Rua', 'Rua', 'Rua', 'Avenida', 'Avenida', 'Travessa', 'Alameda', 'Praça', 'Estrada'];
  const streetNames = [
    'das Flores', 'Sete de Setembro', 'XV de Novembro', 'Tiradentes', 'Dom Pedro II', 'Santos Dumont',
    'Getúlio Vargas', 'Rui Barbosa', 'Marechal Deodoro', 'Floriano Peixoto', 'Duque de Caxias', 'das Palmeiras',
    'dos Andradas', 'Brasil', 'Independência', 'São João', 'Barão do Rio Branco', 'Castro Alves',
    'Monteiro Lobato', 'Machado de Assis', 'José de Alencar', 'Carlos Gomes', 'Amazonas', 'Paraná',
    'das Acácias', 'dos Ipês', 'Bela Vista', 'Boa Esperança', 'Presidente Vargas', 'Princesa Isabel',
  ];
  const neighborhoods = [
    'Centro', 'Jardim América', 'Vila Nova', 'Boa Vista', 'Santa Cruz', 'São José', 'Jardim Europa',
    'Vila Mariana', 'Parque das Nações', 'Alto da Glória', 'Bela Vista', 'Cidade Nova', 'Jardim Botânico',
    'Liberdade', 'Santo Antônio', 'Morada do Sol', 'Industrial', 'Jardim Paulista', 'Vila Rica', 'Novo Horizonte',
  ];
  const complements = ['', '', '', 'Casa', 'Apto 101', 'Apto 302', 'Bloco B', 'Sala 5', 'Fundos', 'Casa 2'];

  const emailDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br', 'uol.com.br', 'bol.com.br', 'icloud.com'];

  const companyActivities = [
    'Comércio de Alimentos', 'Tecnologia', 'Construções', 'Transportes', 'Consultoria', 'Engenharia',
    'Serviços Médicos', 'Distribuidora', 'Informática', 'Indústria Metalúrgica', 'Logística', 'Contabilidade',
    'Materiais de Construção', 'Comércio de Roupas', 'Agropecuária', 'Educação', 'Software', 'Turismo',
  ];
  const companySuffixes = ['Ltda', 'Ltda', 'Ltda', 'S.A.', 'ME', 'EPP'];
  const fantasyWords = [
    'Nova Era', 'Horizonte', 'Prime', 'Alfa', 'Ideal', 'Brasil', 'Total', 'Mais', 'Center', 'Express',
    'Max', 'Real', 'Futura', 'Líder', 'Solar', 'Vitória', 'Atlântico', 'Pioneira', 'Global', 'União',
  ];

  // Lista de instituições com código COMPE.
  const banks = [
    ['001', 'Banco do Brasil S.A.'], ['003', 'Banco da Amazônia S.A.'], ['004', 'Banco do Nordeste do Brasil S.A.'],
    ['021', 'Banestes S.A.'], ['033', 'Banco Santander (Brasil) S.A.'], ['037', 'Banco do Estado do Pará S.A. (Banpará)'],
    ['041', 'Banco do Estado do Rio Grande do Sul S.A. (Banrisul)'], ['047', 'Banco do Estado de Sergipe S.A. (Banese)'],
    ['069', 'Banco Crefisa S.A.'], ['070', 'BRB - Banco de Brasília S.A.'], ['074', 'Banco J. Safra S.A.'],
    ['077', 'Banco Inter S.A.'], ['085', 'Cooperativa Central Ailos'], ['104', 'Caixa Econômica Federal'],
    ['121', 'Banco Agibank S.A.'], ['136', 'Unicred do Brasil'], ['197', 'Stone Instituição de Pagamento S.A.'],
    ['208', 'Banco BTG Pactual S.A.'], ['212', 'Banco Original S.A.'], ['218', 'Banco BS2 S.A.'],
    ['237', 'Banco Bradesco S.A.'], ['246', 'Banco ABC Brasil S.A.'], ['260', 'Nu Pagamentos S.A. (Nubank)'],
    ['290', 'PagSeguro Internet S.A. (PagBank)'], ['318', 'Banco BMG S.A.'], ['323', 'Mercado Pago'],
    ['336', 'Banco C6 S.A.'], ['341', 'Itaú Unibanco S.A.'], ['376', 'Banco J.P. Morgan S.A.'],
    ['380', 'PicPay'], ['389', 'Banco Mercantil do Brasil S.A.'], ['403', 'Cora SCD S.A.'],
    ['422', 'Banco Safra S.A.'], ['623', 'Banco Pan S.A.'], ['633', 'Banco Rendimento S.A.'],
    ['637', 'Banco Sofisa S.A.'], ['655', 'Banco Votorantim S.A. (BV)'], ['707', 'Banco Daycoval S.A.'],
    ['735', 'Banco Neon S.A.'], ['745', 'Banco Citibank S.A.'], ['748', 'Banco Cooperativo Sicredi S.A.'],
    ['756', 'Banco Cooperativo Sicoob S.A.'],
  ].map(([code, name]) => ({ code, name }));

  // [marca, WMI do chassi, modelos]
  const vehicles = [
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
  const vehicleColors = ['Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Marrom', 'Verde', 'Bege'];
  const fuels = ['Flex', 'Flex', 'Flex', 'Gasolina', 'Diesel', 'Elétrico', 'Híbrido'];

  const racaCor = ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena'];
  const orientacaoSexual = ['Heterossexual', 'Homossexual', 'Bissexual', 'Pansexual', 'Assexual', 'Prefiro não informar'];
  const identidadeGenero = ['Cisgênero', 'Transgênero', 'Não binário', 'Gênero fluido', 'Prefiro não informar'];
  const tiposSanguineos = ['O+', 'O+', 'O+', 'A+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
  const estadoCivil = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável'];
  const profissoes = [
    'Analista de Sistemas', 'Professor(a)', 'Enfermeiro(a)', 'Engenheiro(a) Civil', 'Contador(a)', 'Advogado(a)',
    'Vendedor(a)', 'Motorista', 'Designer', 'Médico(a)', 'Administrador(a)', 'Eletricista', 'Arquiteto(a)',
  ];

  // Imóveis: [tipo, área mín, área máx, quartos mín, quartos máx, vagas máx, tem condomínio]
  const propertyTypes = [
    ['Apartamento', 40, 180, 1, 4, 3, true], ['Casa', 70, 400, 1, 5, 4, false],
    ['Casa em condomínio', 120, 450, 2, 5, 4, true], ['Cobertura', 120, 400, 2, 5, 4, true],
    ['Sala comercial', 25, 150, 0, 0, 2, true], ['Loja', 40, 300, 0, 0, 3, false],
    ['Terreno', 150, 1000, 0, 0, 0, false], ['Galpão', 300, 3000, 0, 0, 10, false],
  ].map(([type, areaMin, areaMax, roomsMin, roomsMax, parkingMax, condo]) =>
    ({ type, areaMin, areaMax, roomsMin, roomsMax, parkingMax, condo }));

  root.FD_DATA = {
    maleNames, femaleNames, surnames, cities, states, streetTypes, streetNames, neighborhoods, complements,
    emailDomains, companyActivities, companySuffixes, fantasyWords, banks, vehicles, vehicleColors, fuels,
    racaCor, orientacaoSexual, identidadeGenero, tiposSanguineos, estadoCivil, profissoes, propertyTypes,
  };
})(globalThis);
