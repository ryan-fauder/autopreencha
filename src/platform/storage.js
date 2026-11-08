/**
 * Padrão Repository: concentra as chaves e os valores padrão do browser.storage.local.
 * Nenhum outro módulo conhece os nomes das chaves.
 */

const SETTINGS_DEFAULTS = { mask: true, uf: '' };
const DATA_KEY = 'fdData';
const UI_KEY = 'fdUi';

const local = () => browser.storage.local;

function onLocalChange(listener) {
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') listener(changes);
  });
}

/** Preferências que valem para popup, barra lateral e menu de contexto. */
export const settingsRepository = {
  get: () => local().get(SETTINGS_DEFAULTS),
  save: (patch) => local().set(patch),
  /** Avisa só das preferências que mudaram: listener({ mask?, uf? }). */
  onChange(listener) {
    onLocalChange((changes) => {
      const patch = {};
      for (const key of Object.keys(SETTINGS_DEFAULTS)) if (changes[key]) patch[key] = changes[key].newValue;
      if (Object.keys(patch).length) listener(patch);
    });
  },
};

/**
 * Valores gerados e estado da interface do popup, guardados para sobreviver ao fechamento.
 * `origin` identifica a janela que gravou, para que ela ignore o eco da própria gravação.
 */
export const sessionRepository = {
  async load() {
    const saved = await local().get({ [DATA_KEY]: null, [UI_KEY]: null });
    const { origin, ...data } = saved[DATA_KEY] || {};
    return { data, ui: saved[UI_KEY] || {} };
  },
  saveData: (data, origin) => local().set({ [DATA_KEY]: { ...data, origin } }),
  saveUi: (ui) => local().set({ [UI_KEY]: ui }),
  /** listener(data, origin) quando outra janela grava valores gerados. */
  onDataChange(listener) {
    onLocalChange((changes) => {
      const value = changes[DATA_KEY]?.newValue;
      if (!value) return;
      const { origin, ...data } = value;
      listener(data, origin);
    });
  },
};
