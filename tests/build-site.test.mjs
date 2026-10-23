import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildSite } from '../scripts/build-site.mjs';

const sourceRoot = process.env.ORDEM_MESTRE_SOURCE || 'C:/Ordem-Mestre-v2.8.6-Windows';

test('buildSite exports the public ritual catalog and validates its asset boundary', async () => {
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ordem-rituais-site-'));

  try {
    const result = await buildSite({ sourceRoot, outputRoot });
    const rituals = JSON.parse(fs.readFileSync(path.join(outputRoot, 'data', 'rituais.json'), 'utf8'));
    const rules = JSON.parse(fs.readFileSync(path.join(outputRoot, 'data', 'regras.json'), 'utf8'));

    assert.equal(result.ritualCount, 81);
    assert.equal(rituals.length, 81);
    assert.equal(new Set(rituals.map((ritual) => ritual.id)).size, 81);
    assert.ok(rituals.every((ritual) => ritual.id && ritual.nome && ritual.circulo));
    assert.ok(rules.length > 0);
    assert.ok(rules.every((rule) => rule.categoria === 'rituais'));
    assert.ok(result.copiedAssets.length > 0);
    assert.ok(result.copiedAssets.every((asset) => fs.existsSync(path.join(outputRoot, asset))));

    const exported = fs.readFileSync(path.join(outputRoot, 'data', 'rituais.json'), 'utf8');
    assert.doesNotMatch(exported, /%APPDATA%|\\AppData\\|campaigns|agents|encounters/i);
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
});
