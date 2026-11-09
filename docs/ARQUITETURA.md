# Arquitetura

O Autopreencha é escrito em **JavaScript puro com módulos ES nativos**, sem bundler nem etapa de build.
O pacote enviado à Mozilla é exatamente o código-fonte de `src/`, o que mantém a revisão simples
(nenhum código minificado ou gerado).

## Camadas

```
src/
├── data/        Dados puros (nomes, cidades, bancos, CEPs reais…). Nenhuma lógica.
├── core/        Regras de negócio. Não conhece o navegador: roda e é testado em Node.
│   └── documents/   Documentos com dígito verificador (pessoa, empresa, inscrição estadual).
├── content/     Funções injetadas na página. Autocontidas: tudo chega por argumento.
├── platform/    Adaptadores das APIs do Firefox (abas, permissões, injeção, armazenamento).
├── features/    Casos de uso que atuam na página, compartilhados por background e popup.
├── background/  Menu de contexto e atalho de teclado.
└── popup/       Interface do popup e da barra lateral.
```

As dependências só apontam "para baixo":

```
background, popup  →  features  →  core, content, platform  →  data
```

- `core` nunca importa `platform`, `popup` ou `background`.
- Só `platform` chama `browser.*` (exceto o registro de listeners em `background/`). O resto pede "rode isto na página" ou "salve isto" sem saber como.
- `content` não importa nada em tempo de execução: o Firefox serializa a função antes de injetá-la.

## Padrões de projeto

| Padrão | Onde | Problema que resolve |
|---|---|---|
| **Strategy** | `core/documents/inscricao-estadual.js`, `core/finance.js` | Cada UF tem seu algoritmo de IE e cada banco o seu de DV. Um mapa de estratégias troca `if/else` gigantes por uma entrada por caso. |
| **Registry** | `core/registry.js` | Fonte única dos tipos de valor. Menu de contexto e aba Gerador são montados a partir dele: um tipo novo aparece nos dois lugares. |
| **Factory** | `core/factories.js` | Monta entidades completas e coerentes (mesma UF no endereço, DDD, CPF e título; nome do titular no cartão). |
| **Repository** | `platform/storage.js` | Concentra chaves e valores padrão do `storage`. Nenhum outro módulo sabe como os dados são guardados. |
| **Adapter** | `platform/browser-page.js` | Esconde a injeção na página e seus casos de erro (iframes de outra origem, falta de permissão). |
| **Observer** | `popup/store.js` | Estado único do popup; renderização e persistência reagem a cada mudança. |
| **Command** | `popup/commands.js` | Cada ação que toca o navegador é uma função isolada, que devolve um resultado em vez de decidir a mensagem. |

## Fluxos principais

**Preencher a página** (botão, menu ou Alt+Shift+P)
1. `features/page-actions.js → fillPage()` cria um perfil com `core/factories.js → createFormProfile()`.
2. Injeta `content/fill-form.js` com o perfil e as regras de `content/field-rules.js` como argumentos.
3. O motor reconhece cada campo (autocomplete → regras por texto → tipo do input) e dispara `input`/`change`.

**Popup**
1. `popup/main.js` carrega preferências e sessão dos repositórios e cria o store.
2. Toda mudança passa por `update()`, que completa o que faltar com `popup/generation.js`.
3. O store notifica: `views/render.js` redesenha e os repositórios gravam. Popup e barra lateral se
   sincronizam pelo `storage.onChanged`, ignorando o eco das próprias gravações.

## Firefox e Chrome

`src/` é a versão do Firefox e é publicada como está. `npm run build:chrome` gera `dist/chrome/` a partir dela:

- o manifest é derivado de `src/manifest.json` (service worker, `contextMenus`, `side_panel`, ícones PNG);
- `platform/compat.js`, primeiro import do background e do popup, aponta `browser` para `chrome` e
  `menus` para `contextMenus`;
- os arquivos de `chrome/` substituem os de mesmo caminho: hoje só `platform/sidebar.js`, porque a barra
  lateral do Firefox (`sidebarAction`) e o painel lateral do Chrome (`sidePanel`) não têm API comum.

## Dados gerados fora da extensão

`src/data/ceps.js` contém CEPs reais (logradouro, bairro e faixa de numeração) obtidos da API pública
ViaCEP por `scripts/build-ceps.mjs`. É só dado: a extensão não faz nenhuma requisição externa.
Para atualizar: `npm run ceps`.

## Testes

```
test/
├── validators.js        Validadores escritos de forma independente dos geradores.
├── core/                Documentos, finanças, veículos, imóveis, geografia e registro.
└── content/             Preenchimento de formulário num DOM simulado (jsdom).
```

`core/random.js` permite fixar uma semente (`useSeed`), o que torna a geração reproduzível nos testes.

## Como estender

- **Novo tipo de valor:** escreva o gerador em `core/` e registre-o em `core/registry.js`.
- **Novo campo reconhecido no preenchimento:** acrescente uma regra em `content/field-rules.js`
  (a ordem é a prioridade) e, se preciso, a chave em `createFormProfile()`.
- **Novo banco com algoritmo de DV próprio:** adicione uma estratégia em `ACCOUNT_STRATEGIES`.
- **Novo campo em uma aba do popup:** acrescente-o em `popup/views/fields.js`.
