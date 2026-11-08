'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const LIB = path.join(__dirname, '..', 'src', 'lib');

// Carrega os scripts da extensão (que se registram em globalThis) num contexto isolado.
function loadLib(extraGlobals = {}) {
  const ctx = vm.createContext({ ...extraGlobals });
  for (const f of ['data.js', 'generators.js', 'fill.js']) {
    vm.runInContext(fs.readFileSync(path.join(LIB, f), 'utf8'), ctx, { filename: f });
  }
  return Object.assign(ctx.FakeData, { FILL: ctx.FD_FILL });
}

module.exports = { loadLib };
