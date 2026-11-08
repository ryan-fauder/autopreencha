# Publicação no addons.mozilla.org (AMO)

Tudo o que a ficha da extensão pede está nesta pasta:

| Arquivo | Uso |
|---|---|
| `icon-128.png` | Ícone da ficha (128×128) |
| `screenshots/*.png` | Capturas de tela (1280×800) |
| Seções abaixo | Textos para copiar e colar nos campos do formulário |

## Primeira publicação (pelo site)

A primeira versão é enviada pelo site, porque é ali que se cria a ficha da extensão
(categoria, licença, descrição).

1. Gere o pacote: `npm test && npm run lint && npm run build`. O arquivo sai em `dist/`.
2. Entre em <https://addons.mozilla.org/developers/> com uma conta Firefox.
3. **Enviar uma nova extensão** → escolha **Neste site** (listada publicamente).
4. Envie o `.zip` de `dist/`. A validação automática deve passar sem avisos.
5. Quando perguntar sobre código-fonte, responda **Não**: o código não é minificado, transpilado nem
   empacotado, e o `.zip` já é o código-fonte legível.
6. Preencha a ficha com os textos abaixo, envie o ícone e as capturas de tela.
7. Cole as **notas para o revisor** no campo próprio e envie.

A revisão humana da Mozilla costuma levar de algumas horas a alguns dias. Depois de aprovada, a extensão
aparece na busca do AMO.

## Atualizações (pela linha de comando)

1. Atualize a versão em `src/manifest.json` e `package.json` e registre a mudança no `CHANGELOG.md`.
2. Crie as chaves de API em <https://addons.mozilla.org/developers/addon/api/key/>.
3. Envie a nova versão:

   ```bash
   export WEB_EXT_API_KEY="user:12345:67"     # "Emissor JWT"
   export WEB_EXT_API_SECRET="…"              # "Segredo JWT" (não versione!)
   npm run sign
   ```

4. Faça o commit e crie a tag: `git tag -a vX.Y.Z -m "Versão X.Y.Z"`.

---

## Textos da ficha

**Nome** (41 de 50 caracteres permitidos)
Autopreencha – Gerador de dados fictícios

**Resumo** (até 250 caracteres)
Preenchimento automático de formulários com dados fictícios válidos: CPF, CNPJ (inclusive alfanumérico),
RG, CNH, PIS, CNS, título, Inscrição Estadual, cartão, conta, placa, RENAVAM, endereço e imóvel. Para
testes de software.

**Categoria**
Ferramentas de desenvolvimento (Web Development)

**Licença**
MIT

**Política de privacidade**
Não é necessária: a extensão não coleta, armazena remotamente nem transmite nenhum dado
(`data_collection_permissions: none`).

**Descrição** (Markdown)

```markdown
**Autopreencha** preenche formulários com dados brasileiros fictícios — e válidos — para quem desenvolve, testa ou estuda software. Todos os documentos saem com dígitos verificadores corretos.

**O que gera**

- **Pessoa:** nome, nascimento, CPF, RG, CNH, PIS/PASEP, CNS (Cartão SUS), título de eleitor, passaporte, e-mail, celular, filiação, cor/raça, orientação sexual, identidade de gênero, tipo sanguíneo e endereço
- **Empresa:** CNPJ, CNPJ alfanumérico (novo padrão da Receita Federal), Inscrição Estadual das 27 UFs, razão social
- **Veículo:** RENAVAM, placa antiga, placa Mercosul, chassi
- **Financeiro:** cartão de crédito (Visa, Mastercard, Elo, Amex, Hipercard, Diners, Discover, JCB) e agência/conta com DV oficial de BB, Bradesco, Itaú e Caixa
- **Imóvel:** áreas, valores, inscrição de IPTU, matrícula e Código Nacional de Matrícula (CNM)
- Consulta de códigos de bancos

**Como usar**

- **Preencher página** (ou Alt+Shift+P): preenche o formulário inteiro com uma mesma pessoa fictícia
- Botão direito em um campo → **Autopreencha** → escolha o tipo
- Clique em qualquer valor para copiar, ou use **inserir** para colocá-lo no campo selecionado
- **Fixar** abre a extensão na barra lateral, que fica aberta enquanto você testa
- Com ou sem máscara, e coerente com a UF escolhida (endereço, DDD, CPF, título e IE)

**Privacidade**

Tudo é gerado localmente. Nenhum dado é coletado ou enviado, e a extensão não faz requisições externas.

*Os dados são fictícios e servem apenas para testes. A má utilização é de responsabilidade do usuário.*
```

**Notas para o revisor**

```
No remote code, no minification, no bundling: the uploaded package is the readable source,
written as native ES modules (background uses "type": "module"; the popup loads popup/main.js as a module).
All data is generated locally; nothing is collected or transmitted. The extension makes no network requests.

data/ceps.js is a static data table (real postal codes with street names) built once from the public
ViaCEP API by scripts/build-ceps.mjs in the source repository; it contains data only, no code.
The bundled font (Inter Tight) is under SIL OFL, license included in fonts/OFL.txt.

Permissions:
- menus: context menu to insert generated values into the focused field.
- activeTab + scripting: inject the value / fill the form in the current tab after a user action
  (toolbar click, context menu or keyboard shortcut).
- optional host permission <all_urls>: requested only when the user inserts or fills from the
  sidebar, where activeTab is not granted.
- storage: remembers the user's options and the last generated values.
- clipboardWrite: copy values from the popup.

To test: open any page with a form, click the toolbar icon, then "Preencher página";
or right-click a text field → "Autopreencha" → "Pessoa" → "CPF".
```
