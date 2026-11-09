/**
 * Gera a versão para Chrome em dist/chrome/ e o .zip para a Chrome Web Store.
 * O código é o mesmo de src/; só o manifest muda, derivado de src/manifest.json:
 * service worker em vez de event page, contextMenus em vez de menus, side_panel em vez de
 * sidebar_action e ícones PNG (o Chrome não aceita SVG no manifest).
 *
 * Os módulos em chrome/ substituem os de mesmo caminho em src/.
 *
 * Uso: npm run build:chrome   (o .zip requer python3)
 */
import { execFileSync } from 'node:child_process';
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const OUT = 'dist/chrome';
const manifest = JSON.parse(readFileSync('src/manifest.json', 'utf8'));

const PNG_ICONS = { 16: 'icons/icon-16.png', 32: 'icons/icon-32.png', 48: 'icons/icon-48.png', 128: 'icons/icon-128.png' };
const SIDEBAR_PATH = manifest.sidebar_action.default_panel;

delete manifest.browser_specific_settings;
delete manifest.sidebar_action;
delete manifest.commands._execute_sidebar_action;

manifest.icons = PNG_ICONS;
manifest.action.default_icon = PNG_ICONS;
manifest.background = { service_worker: manifest.background.scripts[0], type: 'module' };
manifest.permissions = [...manifest.permissions.map((p) => (p === 'menus' ? 'contextMenus' : p)), 'sidePanel'];
manifest.side_panel = { default_path: SIDEBAR_PATH };
manifest.minimum_chrome_version = '116';

rmSync(OUT, { recursive: true, force: true });
cpSync('src', OUT, { recursive: true });
cpSync('chrome', OUT, { recursive: true }); // módulos que diferem no Chrome (ex.: barra lateral)
writeFileSync(`${OUT}/manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);

const zip = `dist/autopreencha-chrome-${manifest.version}.zip`;
rmSync(zip, { force: true });
execFileSync('python3', ['-c', `
import os, sys, zipfile
src, out = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(src):
        for f in sorted(files):
            path = os.path.join(root, f)
            z.write(path, os.path.relpath(path, src))
`, OUT, zip]);

console.log(`${OUT}/ e ${zip} gerados.`);
