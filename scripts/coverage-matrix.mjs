#!/usr/bin/env node
// The "45/45 covered" proof. Declares every audit finding and the gate that
// enforces its no-regression guarantee, then verifies the gate is actually
// IMPLEMENTED (invariant check exists / Playwright tag present / validator
// covers it / artifact present). Fails until every finding is truly gated.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { checks as invariantChecks } from './invariants.mjs';
import { COVERS as linkCovers } from './validate-links.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const has = (p) => existsSync(join(ROOT, p));
const readOr = (p) => (has(p) ? readFileSync(join(ROOT, p), 'utf8') : '');

// Primary gate is gates[0]; extra gates are defensive depth. `proxy: true`
// flags findings whose gate is a best-effort machine proxy for a human concern.
const F = (id, sev, kind, phase, gates, proxy = false) => ({ id, sev, kind, phase, gates, proxy });

export const FINDINGS = [
  // P0 — reactivation blockers
  F('BUILD-01', 'high', 'enhancement', 'P0', ['invariants', 'build']),
  F('SUP-07', 'high', 'security', 'P0', ['invariants']),
  F('BUILD-02', 'high', 'enhancement', 'P0', ['invariants', 'build']),
  F('OPS-03', 'high', 'enhancement', 'P0', ['docker']),
  F('SUP-01', 'medium', 'security', 'P0', ['invariants']),
  F('OPS-04', 'low', 'enhancement', 'P0', ['invariants', 'hadolint']),
  // P1 — security hardening
  F('SUP-02', 'high', 'security', 'P1', ['invariants', 'actionlint']),
  F('SEC-03', 'medium', 'security', 'P1', ['links']),
  F('SEC-04', 'medium', 'security', 'P1', ['links']),
  F('SEC-05', 'medium', 'security', 'P1', ['invariants']),
  F('SUP-03', 'medium', 'security', 'P1', ['invariants']),
  F('SUP-04', 'medium', 'security', 'P1', ['invariants', 'hadolint']),
  F('CI-01', 'medium', 'enhancement', 'P1', ['invariants', 'actionlint']),
  F('OPS-05', 'low', 'security', 'P1', ['invariants']),
  F('OPS-06', 'low', 'security', 'P1', ['invariants']),
  F('OPS-07', 'low', 'security', 'P1', ['invariants']),
  F('SUP-05', 'low', 'security', 'P1', ['invariants', 'dependabot']),
  // P2 — correctness & accessibility
  F('JS-01', 'high', 'enhancement', 'P2', ['playwright']),
  F('A11Y-01', 'high', 'enhancement', 'P2', ['invariants', 'pa11y', 'playwright']),
  F('JS-02', 'medium', 'enhancement', 'P2', ['playwright']),
  F('A11Y-02', 'medium', 'enhancement', 'P2', ['invariants', 'pa11y']),
  F('A11Y-03', 'medium', 'enhancement', 'P2', ['invariants', 'pa11y']),
  F('A11Y-04', 'medium', 'enhancement', 'P2', ['invariants']),
  F('CSS-01', 'medium', 'enhancement', 'P2', ['invariants']),
  F('JS-03', 'low', 'enhancement', 'P2', ['playwright', 'invariants']),
  F('A11Y-05', 'low', 'enhancement', 'P2', ['playwright', 'invariants']),
  F('HTML-01', 'low', 'enhancement', 'P2', ['invariants', 'pa11y']),
  F('JS-04', 'low', 'enhancement', 'P2', ['playwright', 'invariants']),
  // P3 — SEO / docs / packaging / polish
  F('CSS-02', 'medium', 'enhancement', 'P3', ['invariants', 'build']),
  F('SEO-01', 'medium', 'enhancement', 'P3', ['invariants']),
  F('PERF-01', 'medium', 'enhancement', 'P3', ['invariants', 'lighthouse']),
  F('PERF-02', 'medium', 'enhancement', 'P3', ['invariants', 'lighthouse']),
  F('DOC-01', 'medium', 'enhancement', 'P3', ['invariants'], true),
  F('DOC-02', 'medium', 'enhancement', 'P3', ['invariants'], true),
  F('TPL-01', 'medium', 'enhancement', 'P3', ['invariants', 'build']),
  F('SEO-02', 'low', 'enhancement', 'P3', ['invariants']),
  F('SEO-03', 'low', 'enhancement', 'P3', ['invariants']),
  F('PERF-03', 'low', 'enhancement', 'P3', ['invariants']),
  F('REL-01', 'low', 'enhancement', 'P3', ['invariants'], true),
  F('DOC-03', 'low', 'enhancement', 'P3', ['invariants']),
  F('ENV-01', 'low', 'enhancement', 'P3', ['invariants']),
  F('REPO-01', 'low', 'enhancement', 'P3', ['invariants']),
  F('INFO-01', 'info', 'enhancement', 'P3', ['dependabot'], true),
  F('INFO-02', 'info', 'enhancement', 'P3', ['invariants']),
  F('INFO-03', 'info', 'enhancement', 'P3', ['invariants']),
];

const EXPECTED_TOTAL = 45;

const invariantIds = new Set(invariantChecks.map((c) => c.id));
const specText = readOr('tests/behavior.spec.ts') + readOr('tests/behavior.spec.js');
const playwrightTags = new Set([...specText.matchAll(/@([A-Z][A-Z0-9]*-\d+)/g)].map((m) => m[1]));

// Is a finding's PRIMARY gate actually implemented?
function gateImplemented(gate) {
  switch (gate) {
    case 'invariants':
      return { probe: (id) => invariantIds.has(id), why: 'invariant check present' };
    case 'links':
      return { probe: (id) => linkCovers.includes(id), why: 'links validator covers it' };
    case 'playwright':
      return { probe: (id) => playwrightTags.has(id), why: 'Playwright @tag present' };
    case 'pa11y':
      return { probe: () => has('.pa11yci.json'), why: '.pa11yci.json present' };
    case 'lighthouse':
      return { probe: () => has('lighthouserc.json'), why: 'lighthouserc.json present' };
    case 'actionlint':
      return { probe: () => has('.github/workflows/ci.yml'), why: 'CI workflow present' };
    case 'hadolint':
      return { probe: () => has('Dockerfile') && has('.hadolint.yaml'), why: 'Dockerfile + hadolint cfg' };
    case 'docker':
      return { probe: () => has('Dockerfile') && has('docker-compose.yaml'), why: 'Docker build present' };
    case 'dependabot':
      return { probe: () => has('.github/dependabot.yml'), why: 'dependabot.yml present' };
    case 'build':
      return { probe: () => has('Makefile'), why: 'build gate present' };
    default:
      return { probe: () => false, why: `unknown gate ${gate}` };
  }
}

function main() {
  const errors = [];
  const rows = [];
  for (const f of FINDINGS) {
    const primary = f.gates[0];
    const g = gateImplemented(primary);
    const covered = g.probe(f.id);
    rows.push({ ...f, primary, covered, why: g.why });
    if (!covered) errors.push(`${f.id}: primary gate '${primary}' not implemented (${g.why})`);
  }

  // Structural assertions.
  if (FINDINGS.length !== EXPECTED_TOTAL)
    errors.push(`expected ${EXPECTED_TOTAL} findings, found ${FINDINGS.length}`);
  const ids = new Set(FINDINGS.map((f) => f.id));
  if (ids.size !== FINDINGS.length) errors.push('duplicate finding IDs in matrix');
  for (const f of FINDINGS)
    if (f.gates.length === 0) errors.push(`${f.id}: no gate assigned`);

  // No orphan assertions: every invariant check / Playwright tag must map to a known finding.
  for (const id of invariantIds)
    if (!ids.has(id)) errors.push(`invariant check '${id}' has no matching finding`);
  for (const id of playwrightTags)
    if (!ids.has(id)) errors.push(`Playwright tag '@${id}' has no matching finding`);

  // Report.
  const coveredCount = rows.filter((r) => r.covered).length;
  const byPhase = { P0: [], P1: [], P2: [], P3: [] };
  for (const r of rows) byPhase[r.phase].push(r);
  for (const phase of ['P0', 'P1', 'P2', 'P3']) {
    console.log(`\n${phase}`);
    for (const r of byPhase[phase]) {
      const mark = r.covered ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
      const px = r.proxy ? ' (proxy)' : '';
      console.log(`  ${mark} ${r.id.padEnd(9)} → ${r.primary}${px}`);
    }
  }
  console.log(`\ncoverage: ${coveredCount}/${FINDINGS.length} findings gated`);

  if (errors.length) {
    console.error('\n\x1b[31mCOVERAGE INCOMPLETE\x1b[0m');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('\x1b[32m✅ all 45 findings are gated\x1b[0m');
}

if (import.meta.url === `file://${process.argv[1]}`) main();
