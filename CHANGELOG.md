# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e versionamento
[SemVer](https://semver.org/lang/pt-BR/). A versão também fica em `src/manifest.json` e `package.json`.

## [1.4.2] - 2026-11-09

### Alterado
- Resumo da extensão reescrito sem lista de palavras-chave, que a Chrome Web Store rejeita
  ("Spam and Placement in the Store").

## [1.4.1] - 2026-11-09

### Adicionado
- Versão para Chrome: `npm run build:chrome` gera `dist/chrome/` e o `.zip` para a Chrome Web Store
  (service worker, menu de contexto e painel lateral do Chrome, ícones PNG).
- Política de privacidade em `docs/privacidade.html`, publicada pelo GitHub Pages.
- Blocos promocionais da Chrome Web Store em `store/`.

### Corrigido
- Menus de seleção (UF, banco, bandeira) ilegíveis no tema escuro: a lista aberta mostrava texto claro
  sobre o fundo claro do sistema.

## [1.4.0] - 2026-11-08

### Corrigido
- **CEP agora é real.** Antes o CEP era sorteado dentro da faixa da cidade e quase nunca existia, o que
  quebrava formulários que consultam o CEP (ex.: ViaCEP). Agora vem de uma base de 800 CEPs reais (34 cidades),
  com logradouro e bairro verdadeiros e número dentro da faixa e do lado (par/ímpar) do CEP.
- Inscrição Estadual do AM sorteava o primeiro dígito só uma vez por sessão.

### Alterado
- Código reorganizado em camadas (`data`, `core`, `content`, `platform`, `features`, `background`, `popup`)
  com módulos ES nativos e padrões Strategy, Registry, Factory, Repository, Adapter, Observer e Command.
  A injeção na página deixou de estar duplicada entre popup e background.
- Regras de reconhecimento de campos separadas do motor de preenchimento.
- Testes organizados por camada; geração reproduzível com semente.

### Adicionado
- `docs/ARQUITETURA.md` e `scripts/build-ceps.mjs` (`npm run ceps`).

## [1.3.0] - 2026-11-08

### Alterado
- Identidade **Minimalista suíço**: ícone vermelho com três linhas de formulário (versão própria para 16 px),
  preto/branco/cinza com um único vermelho de ação, filetes no lugar de caixas e raio zero, nos temas claro e escuro.
- Fonte Inter Tight empacotada na extensão (sem requisições externas).
- Avisos com a voz do guia ("Nenhuma pessoa real foi incomodada.").
- Capturas e ícone da loja refeitos no novo estilo.

### Adicionado
- Style guide em `docs/style-guide.pdf` (fonte HTML e script `npm run docs:pdf`).

## [1.2.0] - 2026-11-08

### Alterado
- Nova identidade: a extensão passa a se chamar **Autopreencha – Gerador de dados fictícios**.
- Ícone novo (ficha com campo preenchido e selo de preenchimento automático) e paleta azul com destaque âmbar.
- Cabeçalho com nome e descritor; textos do menu de contexto, atalhos, loja e documentação atualizados.
- ID da extensão alterado para `autopreencha@ryanfauder` (antes da primeira publicação).

## [1.1.1] - 2026-11-08

### Corrigido
- Nome da mãe/pai podia repetir o mesmo sobrenome em sequência (ex.: "Márcia Rocha Rocha").

### Adicionado
- Material de publicação no addons.mozilla.org (`store/`) e script `npm run sign`.

## [1.1.0] - 2026-11-08

### Adicionado
- Botão **Fixar**: abre a interface na barra lateral do Firefox, que permanece aberta durante o uso.
- Botão **Inserir** em cada valor, que preenche o campo selecionado na página sem copiar/colar.
- Valores gerados, aba e seleções ficam salvos e sincronizados entre popup e barra lateral.
- Filtro de tipos na aba Gerador e navegação das abas pelo teclado.
- Comando para abrir/fechar a barra lateral (atalho configurável).

### Alterado
- Cabeçalho, abas e barra de ações fixos; somente o conteúdo rola.
- Abas quebram linha em vez de rolar horizontalmente.
- Confirmação visual na linha copiada; layout adaptado para barra lateral estreita.

## [1.0.0] - 2026-11-08

### Adicionado
- Geradores com DV válido: CPF, CNPJ, CNPJ alfanumérico, RG, CNH, PIS, CNS, título de eleitor,
  passaporte, Inscrição Estadual (27 UFs), RENAVAM, placas, chassi, cartões (Luhn), contas bancárias, CNM.
- Pessoa, empresa, veículo e imóvel completos e coerentes com a UF escolhida.
- Menu de contexto, preenchimento de formulário inteiro (Alt+Shift+P) e modo com/sem máscara.
- Testes (node:test + jsdom) e validação com `web-ext lint`.
