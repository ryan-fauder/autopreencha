# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e versionamento
[SemVer](https://semver.org/lang/pt-BR/). A versão também fica em `src/manifest.json` e `package.json`.

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
