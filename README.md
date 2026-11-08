<p align="center"><img src="store/icon-128.png" width="96" alt=""></p>

<h1 align="center">autopreencha</h1>
<p align="center"><strong>Gerador de dados fictícios e preenchimento de formulários</strong> — extensão para Firefox</p>

Gera dados brasileiros **fictícios e válidos** (com dígitos verificadores corretos) para testes de software.
Funciona pelo popup da extensão, direto no campo pelo menu de contexto (botão direito) ou preenchendo o
formulário inteiro com um clique.

> Uso exclusivo para desenvolvimento, QA e estudo. Os dados não pertencem a ninguém; a má utilização é de
> responsabilidade do usuário.

## O que gera

| Grupo | Dados |
|---|---|
| Pessoa | Nome, sexo, nascimento/idade, mãe, pai, **CPF** (respeita a região fiscal da UF), **RG** (SSP-SP), **CNH**, **PIS/PASEP**, **CNS**, **Título de eleitor** (código da UF), **Passaporte**, e-mail, usuário/senha, estado civil, profissão, cor/raça, orientação sexual, identidade de gênero, tipo sanguíneo, altura, peso |
| Empresa | Razão social, nome fantasia, **CNPJ**, **CNPJ alfanumérico** (IN RFB 2.229/2024), **Inscrição Estadual** das 27 UFs, inscrição municipal, data de abertura, site |
| Contato | Celular e telefone fixo (DDD coerente com a cidade), **CEP real** (base dos Correios via ViaCEP, com logradouro, bairro e número dentro da faixa do CEP), endereço completo |
| Veículo | **RENAVAM**, placa antiga (só séries emitidas, até SAV), placa Mercosul, chassi, marca/modelo/ano/cor |
| Financeiro | Agência e conta (DV oficial para BB, Bradesco, Itaú e Caixa), **cartão de crédito** (Luhn) de 8 bandeiras com validade e CVV |
| Imóvel | Tipo, áreas, cômodos, valores de venda/aluguel/condomínio/IPTU, inscrição de IPTU, cartório, matrícula e **CNM** (Provimento CNJ 143/2023, ISO 7064 MOD 97-10), proprietário |
| Bancos | Consulta de códigos COMPE |

Todos os valores podem ser gerados **com ou sem máscara**, e o seletor de **UF** deixa endereço, DDD, CPF,
título e inscrição estadual coerentes com o estado escolhido.

## Formas de uso

- **Popup**: clique no ícone, navegue pelas abas e clique em qualquer valor para copiar. Os valores gerados
  ficam salvos: fechar e reabrir o popup não os perde.
- **Barra lateral (fixar)**: o botão **Fixar** abre a mesma interface na barra lateral do Firefox, que
  continua aberta enquanto você usa a página. Popup e barra lateral ficam sincronizados.
- **Inserir no campo**: o botão ao lado de cada valor insere o valor direto no campo que estava selecionado
  na página, sem copiar e colar. Na barra lateral, o Firefox pede uma vez a permissão de acesso às páginas.
- **Menu de contexto**: clique com o botão direito num campo → *Autopreencha* → escolha o tipo. O valor é
  inserido no campo, já convertido quando o campo é `type="date"`/`number` ou tem `maxlength` menor que o
  valor com máscara.
- **Preencher formulário inteiro**: botão no popup, item no menu de contexto ou atalho **Alt+Shift+P**.
  Os campos são reconhecidos por `autocomplete`, `name`, `id`, `placeholder`, `aria-label` e pelo texto do
  `<label>`, e todos recebem dados da **mesma** pessoa fictícia. Os eventos `input`/`change` são disparados,
  então funciona com React, Vue e Angular.

Também é possível definir um atalho para abrir/fechar a barra lateral. Os atalhos podem ser alterados em `about:addons` → engrenagem → *Gerenciar atalhos de extensões*.

## Identidade visual

Direção **Minimalista suíço**: grade de 8 pt, Inter Tight, preto/branco/cinza e um único vermelho (`#E4002B`)
para o que está ativo. O guia completo — marca, ícone, cores com contraste calculado, tipografia, componentes e
voz — está em [`docs/style-guide.pdf`](docs/style-guide.pdf) (fonte: `docs/style-guide.html`,
regenerar com `npm run docs:pdf`).

## Instalação para desenvolvimento

1. Abra `about:debugging#/runtime/this-firefox`.
2. Clique em **Carregar extensão temporária…** e selecione `src/manifest.json`.

Ou, com Node.js instalado:

```bash
npm install
npm start        # abre um Firefox limpo com a extensão carregada (web-ext run)
```

## Scripts

```bash
npm test         # testes dos algoritmos e do preenchimento de formulários
npm run lint     # validação da Mozilla (web-ext lint)
npm run build    # gera o .zip em dist/ para publicar no addons.mozilla.org
npm run sign     # envia uma nova versão ao AMO (requer chaves de API)
npm run docs:pdf # gera docs/style-guide.pdf a partir do HTML (requer Google Chrome)
npm run ceps     # atualiza src/data/ceps.js com CEPs reais (consulta a API ViaCEP)
```

## Publicação

O passo a passo, os textos da ficha, o ícone e as capturas estão em [`store/`](store/PUBLICACAO.md).

## Estrutura

```
src/
  manifest.json   Manifest V3 (Firefox 140+), módulos ES nativos, sem bundler
  data/           dados puros: nomes, cidades, bancos, veículos, CEPs reais
  core/           regras de negócio e algoritmos de dígito verificador (testáveis em Node)
  content/        funções injetadas na página (inserir valor / preencher formulário) e regras de campos
  platform/       adaptadores das APIs do Firefox (abas, injeção, armazenamento)
  features/       casos de uso na página, compartilhados por background e popup
  background/     menu de contexto e atalho
  popup/          interface do popup e da barra lateral
  fonts/ icons/   Inter Tight (SIL OFL) e ícones
theme/            tema do Firefox (claro/escuro)
scripts/          build-ceps.mjs — atualiza a base de CEPs reais a partir da ViaCEP
test/             testes por camada (node:test + jsdom)
store/            material de publicação no AMO
docs/             arquitetura, style guide (PDF + HTML) e capturas
```

Camadas, padrões de projeto e como estender: [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Observações sobre os algoritmos

- Os DVs foram conferidos com validadores independentes, incluindo a biblioteca `js-brasil`, em milhares de
  amostras de cada tipo.
- **CNH** e **IE de Rondônia** evitam os casos-limite em que validadores populares divergem, para que o
  número seja aceito por todos.
- **Bancos** sem algoritmo de DV público recebem DV módulo 11 genérico; o popup avisa quando é o caso.
- **RG** segue o padrão SSP-SP; os demais estados não têm um algoritmo único.
