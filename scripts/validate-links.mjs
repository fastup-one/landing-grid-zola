#!/usr/bin/env node
// Validates data/links.toml against the same constraints the templates rely on,
// so a malicious or malformed tile fails the build instead of shipping.
//   SEC-03  URL scheme allowlist (only http(s):// or root-relative /...)
//   SEC-04  colors must be strict 6-digit hex (no CSS injection)
//   A11Y-05 colors must be well-formed so contrast can be reasoned about
// Run: `node scripts/validate-links.mjs data/links.toml`
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { parse } from 'smol-toml';

// Findings this validator is the primary gate for (read by coverage-matrix).
export const COVERS = ['SEC-03', 'SEC-04'];

const HEX = /^#[0-9A-Fa-f]{6}$/;
const SCHEME_OK = (u) =>
  /^https?:\/\//i.test(u) || /^\/(?!\/)/.test(u); // http(s) absolute, or root-relative (not protocol-relative)

export function validateTiles(data) {
  const errors = [];
  const tiles = Array.isArray(data?.tiles) ? data.tiles : [];
  if (!tiles.length) errors.push('no [[tiles]] found');
  tiles.forEach((t, i) => {
    const where = `tile[${i}]${t?.name ? ` "${t.name}"` : ''}`;
    if (!t.name || typeof t.name !== 'string') errors.push(`${where}: missing required string "name"`);
    if (!t.url || typeof t.url !== 'string') {
      errors.push(`${where}: missing required string "url"`);
    } else if (!SCHEME_OK(t.url)) {
      errors.push(`${where}: url scheme not allowed → ${JSON.stringify(t.url)} (only http(s):// or /root-relative)`);
    }
    for (const key of ['bg_color', 'txt_color']) {
      if (t[key] !== undefined && !HEX.test(t[key]))
        errors.push(`${where}: ${key} must be #RRGGBB hex, got ${JSON.stringify(t[key])}`);
    }
    if (t.tags !== undefined && (!Array.isArray(t.tags) || t.tags.some((x) => typeof x !== 'string')))
      errors.push(`${where}: tags must be an array of strings`);
  });
  return errors;
}

function main() {
  const arg = process.argv[2] || 'data/links.toml';
  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const path = resolve(ROOT, arg);
  let data;
  try {
    data = parse(readFileSync(path, 'utf8'));
  } catch (e) {
    console.error(`\x1b[31mFAIL\x1b[0m cannot parse ${arg}: ${e.message}`);
    process.exit(1);
  }
  const errors = validateTiles(data);
  if (errors.length) {
    console.error(`\x1b[31mFAIL\x1b[0m ${arg}: ${errors.length} problem(s)`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`\x1b[32mPASS\x1b[0m ${arg}: ${data.tiles.length} tiles valid`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
