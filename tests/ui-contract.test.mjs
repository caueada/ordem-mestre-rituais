import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('catalog source exposes the required accessible regions and controls', () => {
  const html = read('src/index.html');
  const css = read('src/styles.css');
  const app = read('src/app.js');

  for (const id of ['ritual-tab', 'conjuration-tab', 'ritual-search', 'circle-filter', 'element-filter', 'ritual-results', 'ritual-detail', 'rules-view']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(css, /@media/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(app, /data\/rituais\.json/);
  assert.match(app, /data\/regras\.json/);
  assert.match(app, /location\.hash/);
  assert.match(app, /fetch\(/);
  assert.doesNotMatch(app, /source\.append\(node\('p', 'credit-copy'\)\.append\(link\)\)/);
  assert.doesNotMatch(app, /els\.circle\.append\(node\('option'.*?\)\)\.value/);
});
