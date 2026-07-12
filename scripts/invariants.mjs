#!/usr/bin/env node
// No-regression engine. One named check per grep-able audit finding; each is
// tagged with its finding ID so scripts/coverage-matrix.mjs can prove every
// finding is gated. Run: `node scripts/invariants.mjs` (needs a prior build for
// checks that read public/). Exits non-zero if any check fails.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const has = (p) => existsSync(join(ROOT, p));
const size = (p) => (has(p) ? statSync(join(ROOT, p)).size : -1);
const tracked = () =>
  execSync('git ls-files', { cwd: ROOT }).toString().split('\n').filter(Boolean);

// Recursively read every built HTML file (public/**/*.html), concatenated.
function builtHtml() {
  const dir = join(ROOT, 'public');
  if (!existsSync(dir)) return null;
  let out = '';
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) out += readFileSync(p, 'utf8') + '\n';
    }
  };
  walk(dir);
  return out;
}

const ok = (detail = '') => ({ pass: true, detail });
const fail = (detail) => ({ pass: false, detail });

// --- checks -----------------------------------------------------------------
// Each: { id, name, run() -> {pass, detail} }. `id` MUST equal an audit
// finding ID. Add one here as each fix lands; coverage-matrix enforces it.
export const checks = [
  {
    id: 'BUILD-01',
    name: 'Tailwind @apply never uses the group variant (v4 build stays valid)',
    run() {
      const bad = read('src/input.css')
        .split('\n')
        .filter((l) => l.includes('@apply') && /\bgroup\b/.test(l));
      return bad.length ? fail(`group in @apply: ${bad.join(' | ')}`) : ok();
    },
  },
  {
    id: 'INFO-03',
    name: 'Tailwind plugins are loaded via @plugin (not silently bypassed)',
    run() {
      const css = read('src/input.css');
      const missing = ['@tailwindcss/forms', '@tailwindcss/typography'].filter(
        (p) => !css.includes(`@plugin "${p}"`)
      );
      return missing.length ? fail(`missing @plugin: ${missing.join(', ')}`) : ok();
    },
  },
  {
    id: 'SUP-01',
    name: 'package-lock.json is committed (reproducible npm ci)',
    run() {
      return tracked().includes('package-lock.json')
        ? ok()
        : fail('package-lock.json is not tracked by git');
    },
  },
  {
    id: 'REPO-01',
    name: '.gitignore has no hazardous bare `public` pattern (only anchored /public/)',
    run() {
      const bare = read('.gitignore')
        .split('\n')
        .map((l) => l.trim())
        .some((l) => l === 'public' || l === 'public/');
      return bare ? fail('bare `public` pattern present in .gitignore') : ok();
    },
  },
  {
    id: 'ENV-01',
    name: 'Repo-local devbox.json exists and pins Zola (not @latest)',
    run() {
      if (!has('devbox.json')) return fail('no repo-local devbox.json');
      const d = read('devbox.json');
      if (/zola@latest/.test(d)) return fail('devbox.json pins zola@latest');
      if (!/zola@0\.22\.1/.test(d)) return fail('devbox.json does not pin zola@0.22.1');
      return ok();
    },
  },

  // --- Wave 1: self-host, kill CDNs, base_url -------------------------------
  {
    id: 'SUP-07',
    name: 'No Tailwind Play CDN (no unpinned remote script) in built HTML',
    run(html) {
      if (html === null) return fail('site not built');
      return html.includes('cdn.tailwindcss.com')
        ? fail('cdn.tailwindcss.com present in built HTML')
        : ok();
    },
  },
  {
    id: 'BUILD-02',
    name: 'Production base_url is set (no localhost leaking into the build)',
    run(html) {
      const m = read('config.toml').match(/^\s*base_url\s*=\s*"([^"]+)"/m);
      if (!m) return fail('no base_url in config.toml');
      if (/localhost|127\.0\.0\.1/.test(m[1])) return fail(`base_url is ${m[1]}`);
      if (!/^https:\/\//.test(m[1])) return fail(`base_url not https: ${m[1]}`);
      if (html && /localhost:1111/.test(html)) return fail('localhost:1111 in built HTML');
      return ok(m[1]);
    },
  },
  {
    id: 'SUP-03',
    name: 'Fonts/icons self-hosted — no third-party font/CDN hosts in built HTML',
    run(html) {
      if (html === null) return fail('site not built');
      const bad = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'].filter(
        (h) => html.includes(h)
      );
      if (bad.length) return fail(`third-party hosts: ${bad.join(', ')}`);
      if (!read('src/input.css').includes('@font-face')) return fail('no self-hosted @font-face');
      return ok();
    },
  },
  {
    id: 'PERF-02',
    name: 'No duplicate/remote Google Fonts import; single self-hosted source',
    run(html) {
      if (/@import\s+url\(\s*['"]?https?:/i.test(read('src/input.css')))
        return fail('remote @import in src/input.css');
      if (html && html.includes('fonts.googleapis.com')) return fail('Google Fonts <link> in HTML');
      return ok();
    },
  },
  {
    id: 'PERF-01',
    name: 'Font Awesome removed (icons are inline SVG)',
    run(html) {
      if (html === null) return fail('site not built');
      const refs = ['awesome', 'fas fa-', 'far fa-', 'fab fa-'].filter((s) => html.includes(s));
      return refs.length ? fail(`Font Awesome refs: ${refs.join(', ')}`) : ok();
    },
  },
  {
    id: 'CSS-02',
    name: 'Compiled CSS + JS linked, root-relative (origin-agnostic), no inline <style>',
    run(html) {
      if (html === null) return fail('site not built');
      if (size('public/css/tailwind.css') < 1024) return fail('public/css/tailwind.css missing/too small');
      if (/<style[\s>]/i.test(html)) return fail('inline <style> block present in built HTML');
      // Assets must be root-relative (href=/css…), never absolute with a baked
      // host — an absolute origin breaks under the CSP when the site is served on
      // a different host/port (localhost vs 127.0.0.1). Regression guard for the
      // "unstyled container" bug.
      for (const [name, re, abs] of [
        ['stylesheet', /href=["']?\/css\/tailwind\.css/, /href=["']?https?:\/\/[^/"']+\/css\/tailwind\.css/],
        ['script', /src=["']?\/js\/app\.js/, /src=["']?https?:\/\/[^/"']+\/js\/app\.js/],
      ]) {
        if (!re.test(html)) return fail(`${name} not linked root-relative`);
        if (abs.test(html)) return fail(`${name} uses an absolute (origin-locked) URL`);
      }
      return ok();
    },
  },
  {
    id: 'PERF-03',
    name: 'HTML minification enabled',
    run() {
      return /^\s*minify_html\s*=\s*true/m.test(read('config.toml'))
        ? ok()
        : fail('minify_html not enabled in config.toml');
    },
  },

  // --- Wave 2: hardened container -------------------------------------------
  {
    id: 'OPS-03',
    name: 'docker compose builds the site itself (self-contained on a fresh clone)',
    run() {
      if (!has('Dockerfile')) return fail('no Dockerfile');
      const c = read('docker-compose.yaml');
      if (!/\bbuild:/.test(c)) return fail('compose has no build: section');
      if (/:\/usr\/share\/nginx\/html:ro/.test(c) && !/\bbuild:/.test(c))
        return fail('compose mounts prebuilt ./public instead of building');
      return ok();
    },
  },
  {
    id: 'OPS-04',
    name: 'Dockerfile present and .dockerignore does not drop build inputs',
    run() {
      if (!has('Dockerfile')) return fail('Dockerfile missing');
      if (/^\*\.md\s*$/m.test(read('.dockerignore')))
        return fail('.dockerignore blanket-excludes *.md (drops content/*.md)');
      return ok();
    },
  },
  {
    id: 'SUP-04',
    name: 'Container base images pinned by digest (no mutable tags)',
    run() {
      const froms = [...read('Dockerfile').matchAll(/^FROM\s+(\S+)/gm)].map((m) => m[1]);
      const unpinned = froms.filter((f) => !f.includes('@sha256:'));
      return unpinned.length ? fail(`unpinned FROM: ${unpinned.join(', ')}`) : ok();
    },
  },
  {
    id: 'OPS-05',
    name: 'Container hardened (read-only rootfs, no-new-privileges, cap_drop ALL)',
    run() {
      const c = read('docker-compose.yaml');
      const missing = [
        ['read_only: true', /read_only:\s*true/],
        ['no-new-privileges', /no-new-privileges:true/],
        ['cap_drop ALL', /cap_drop:[\s\S]*?-\s*ALL/],
      ].filter(([, re]) => !re.test(c)).map(([n]) => n);
      return missing.length ? fail(`missing: ${missing.join(', ')}`) : ok();
    },
  },
  {
    id: 'OPS-06',
    name: 'nginx hardened (no version banner, gzip, security headers)',
    run() {
      const n = has('nginx/default.conf') ? read('nginx/default.conf') : '';
      if (!n) return fail('nginx/default.conf missing');
      const missing = [
        'server_tokens off',
        'gzip on',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'Referrer-Policy',
      ].filter((s) => !n.includes(s));
      return missing.length ? fail(`missing: ${missing.join(', ')}`) : ok();
    },
  },
  {
    id: 'OPS-07',
    name: 'Published ports bind to loopback, not all interfaces',
    run() {
      const c = read('docker-compose.yaml');
      if (/0\.0\.0\.0:/.test(c)) return fail('a port binds 0.0.0.0');
      const maps = [...c.matchAll(/^\s*-\s*"?([^"\n]+:\d+)"?\s*$/gm)].map((m) => m[1]);
      const portMaps = maps.filter((m) => /:\d+$/.test(m) && /^\S*\d+:\d+$/.test(m));
      const bad = portMaps.filter((m) => !m.startsWith('127.0.0.1:'));
      if (!portMaps.length) return fail('no port mapping found');
      return bad.length ? fail(`ports not loopback-bound: ${bad.join(', ')}`) : ok();
    },
  },

  // --- Wave 3: CSP + input validation ---------------------------------------
  {
    id: 'SEC-05',
    name: 'CSP present (meta for Pages, header for nginx) with no unsafe-eval',
    run(html) {
      if (html === null) return fail('site not built');
      if (!/http-equiv=["']?Content-Security-Policy/i.test(html))
        return fail('no CSP <meta> in built HTML');
      const meta = html.match(/Content-Security-Policy["']?\s+content=["']([^"']+)["']/i);
      if (meta && /unsafe-eval/.test(meta[1])) return fail('CSP allows unsafe-eval');
      if (meta && /script-src[^;]*unsafe-inline/.test(meta[1]))
        return fail('CSP script-src allows unsafe-inline');
      const ng = has('nginx/default.conf') ? read('nginx/default.conf') : '';
      if (!/Content-Security-Policy/.test(ng)) return fail('nginx sets no CSP header');
      return ok();
    },
  },

  // --- Wave 4: CI / supply-chain --------------------------------------------
  {
    id: 'SUP-02',
    name: 'Deploy workflow pins actions to SHA, scopes permissions, filters branch',
    run() {
      const wf = read('.github/workflows/main.yml');
      if (/uses:\s*\S+@(master|main)\b/.test(wf)) return fail('mutable @master/@main action ref');
      const uses = [...wf.matchAll(/uses:\s*(\S+)/g)].map((m) => m[1]);
      const notPinned = uses.filter((u) => !/@[0-9a-f]{40}$/.test(u));
      if (notPinned.length) return fail(`actions not SHA-pinned: ${notPinned.join(', ')}`);
      if (!/^permissions:/m.test(wf)) return fail('no top-level permissions block');
      if (!/branches:\s*\[?\s*main/.test(wf)) return fail('deploy not restricted to main');
      return ok();
    },
  },
  {
    id: 'CI-01',
    name: 'PR CI workflow exists and runs the gate battery',
    run() {
      if (!has('.github/workflows/ci.yml')) return fail('no ci.yml');
      const ci = read('.github/workflows/ci.yml');
      if (!/pull_request/.test(ci)) return fail('ci.yml has no pull_request trigger');
      if (!/make (invariants|build|coverage)/.test(ci)) return fail('ci.yml runs no gate targets');
      return ok();
    },
  },
  {
    id: 'SUP-05',
    name: 'Dependabot configured (npm + actions + docker)',
    run() {
      if (!has('.github/dependabot.yml')) return fail('no .github/dependabot.yml');
      const d = read('.github/dependabot.yml');
      const missing = ['npm', 'github-actions', 'docker'].filter((e) => !d.includes(e));
      return missing.length ? fail(`missing ecosystems: ${missing.join(', ')}`) : ok();
    },
  },
  {
    id: 'INFO-01',
    name: 'Dependency updates are automated (Dependabot present)',
    run() {
      return has('.github/dependabot.yml') ? ok() : fail('no dependabot config');
    },
  },

  // --- Wave 5: a11y + JS correctness ----------------------------------------
  {
    id: 'A11Y-01',
    name: 'Tile links have an accessible name (aria-label)',
    run() {
      return /aria-label="\{\{\s*tile\.name\s*\}\}"/.test(read('themes/landing-grid/templates/index.html'))
        ? ok()
        : fail('tile <a> has no aria-label="{{ tile.name }}"');
    },
  },
  {
    id: 'A11Y-02',
    name: 'Nav links are labelled and their icons are aria-hidden',
    run() {
      const b = read('themes/landing-grid/templates/base.html');
      const icons = read('themes/landing-grid/templates/partials/icons.html');
      if (!/class="nav-item[^"]*"[^>]*aria-label=/.test(b))
        return fail('nav-item links missing aria-label');
      if (!/aria-hidden="true"/.test(icons)) return fail('icon macro not aria-hidden');
      return ok();
    },
  },
  {
    id: 'A11Y-03',
    name: 'Search input has a label and results are announced (aria-live)',
    run() {
      const b = read('themes/landing-grid/templates/base.html');
      if (!/<label[^>]*for="search-input"/.test(b)) return fail('no <label for="search-input">');
      if (!/id="nav-counter"[^>]*aria-live/.test(b)) return fail('counter has no aria-live');
      return ok();
    },
  },
  {
    id: 'A11Y-04',
    name: 'Reduced-motion preference is honored',
    run(html) {
      if (!/prefers-reduced-motion/.test(read('src/input.css')))
        return fail('no prefers-reduced-motion in src/input.css');
      const css = has('public/css/tailwind.css') ? read('public/css/tailwind.css') : '';
      if (css && !/prefers-reduced-motion/.test(css))
        return fail('prefers-reduced-motion missing from compiled CSS');
      return ok();
    },
  },
  {
    id: 'CSS-01',
    name: 'No invalid opacity-3 utility (renders opaque)',
    run(html) {
      const b = read('themes/landing-grid/templates/base.html');
      if (/opacity-3(?![0-9])/.test(b)) return fail('opacity-3 in base.html');
      if (html && /opacity-3(?![0-9])/.test(html)) return fail('opacity-3 in built HTML');
      return ok();
    },
  },
  {
    id: 'HTML-01',
    name: 'Real logo link; base-aware history (no hardcoded root)',
    run() {
      const b = read('themes/landing-grid/templates/base.html');
      const js = read('themes/landing-grid/static/js/app.js');
      if (!/<a[^>]*aria-label="Home"/.test(b)) return fail('logo is not a labelled link');
      if (/replaceState\([^)]*,\s*['"]\/['"]\)/.test(js))
        return fail('hardcoded replaceState to "/"');
      if (!/location\.pathname/.test(js)) return fail('history update not base-aware');
      return ok();
    },
  },
  {
    id: 'JS-03',
    name: 'Visibility tracked by class, not inline-style string matching',
    run() {
      const js = read('themes/landing-grid/static/js/app.js');
      if (/\[style\*=["']display:\s*none/.test(js)) return fail('still matches style="display: none"');
      if (!/is-hidden/.test(js)) return fail('no class-based visibility (is-hidden)');
      return ok();
    },
  },
  {
    id: 'JS-04',
    name: 'Category filter uses token match; dead hidden-tags div removed',
    run() {
      const js = read('themes/landing-grid/static/js/app.js');
      const idx = read('themes/landing-grid/templates/index.html');
      if (!/split\(','\)/.test(js)) return fail('filter not token-split');
      if (/class="hidden">\{\{\s*tile\.tags/.test(idx)) return fail('dead hidden-tags div present');
      return ok();
    },
  },

  // --- Wave 6: SEO / docs / packaging ---------------------------------------
  {
    id: 'SEO-01',
    name: 'Meta description, Open Graph, Twitter card, and canonical present',
    run(html) {
      if (html === null) return fail('site not built');
      // Quote-agnostic: minify_html drops attribute quotes.
      const missing = [
        ['description', /name=["']?description/],
        ['canonical', /rel=["']?canonical/],
        ['og:title', /property=["']?og:title/],
        ['twitter:card', /name=["']?twitter:card/],
      ].filter(([, re]) => !re.test(html)).map(([n]) => n);
      return missing.length ? fail(`missing: ${missing.join(', ')}`) : ok();
    },
  },
  {
    id: 'SEO-02',
    name: 'Favicon exists, is linked, and is served',
    run(html) {
      if (!has('static/favicon.svg')) return fail('static/favicon.svg missing');
      if (html && !/href=["']?\/favicon\.svg/.test(html)) return fail('favicon not linked root-relative');
      if (has('public') && !has('public/favicon.svg')) return fail('favicon not in build output');
      return ok();
    },
  },
  {
    id: 'SEO-03',
    name: 'Custom 404 template (not Zola’s default stub)',
    run() {
      if (!has('themes/landing-grid/templates/404.html')) return fail('no themed 404.html');
      if (has('public/404.html')) {
        const p = read('public/404.html');
        if (!/lang=["']?en/.test(p)) return fail('built 404 has no lang (default stub)');
      }
      return ok();
    },
  },
  {
    id: 'TPL-01',
    name: 'page/section templates exist; no Zola placeholder in output',
    run(html) {
      for (const t of ['page.html', 'section.html']) {
        if (!has(`themes/landing-grid/templates/${t}`)) return fail(`missing ${t}`);
      }
      if (html && /couldn't find a template|Welcome to Zola/i.test(html))
        return fail('Zola placeholder text present in built HTML');
      return ok();
    },
  },
  {
    id: 'DOC-01',
    name: 'README reflects reality (no CDN advertised; documents the v4 build)',
    run() {
      const r = read('README.md');
      if (/cdn\.tailwindcss\.com/.test(r)) return fail('README references the removed CDN');
      if (/(Edit|edit)\s+`?tailwind\.config\.js/.test(r))
        return fail('README still instructs editing tailwind.config.js');
      if (!/Tailwind v4/.test(r)) return fail('README not updated for Tailwind v4');
      return ok();
    },
  },
  {
    id: 'DOC-02',
    name: 'Theme README structure matches the actual template set',
    run() {
      const r = read('themes/landing-grid/README.md');
      if (/(Edit|edit)\s+`?tailwind\.config\.js/.test(r))
        return fail('theme README still instructs editing tailwind.config.js');
      if (!/icons\.html/.test(r) || !/app\.js/.test(r))
        return fail('theme README structure omits real files (icons.html/app.js)');
      return ok();
    },
  },
  {
    id: 'DOC-03',
    name: 'theme.toml has no placeholder metadata',
    run() {
      const t = read('themes/landing-grid/theme.toml');
      const bad = ['yourdemo.com', 'Landing Grid Team'].filter((s) => t.includes(s));
      if (bad.length) return fail(`placeholder(s): ${bad.join(', ')}`);
      if (!has('themes/landing-grid/screenshot.png')) return fail('theme screenshot missing');
      return ok();
    },
  },
  {
    id: 'REL-01',
    name: 'Release/versioning discipline (tag-checked release workflow + changelog)',
    run() {
      if (!has('.github/workflows/release.yml')) return fail('no release workflow');
      if (!has('CHANGELOG.md')) return fail('no CHANGELOG.md');
      return ok();
    },
  },
  {
    id: 'INFO-02',
    name: 'No oversized screenshot committed at the repo root',
    run() {
      if (!has('screenshot.png')) return ok();
      return size('screenshot.png') < 150 * 1024 ? ok() : fail('root screenshot.png > 150KB');
    },
  },
];

// --- runner -----------------------------------------------------------------
function main() {
  const html = builtHtml();
  if (html === null) {
    console.error(
      'note: public/ not built — checks that read built HTML will be skipped/fail. Run `make build` first.'
    );
  }
  let failed = 0;
  for (const c of checks) {
    let r;
    try {
      r = c.run(html);
    } catch (e) {
      r = fail(`threw: ${e.message}`);
    }
    const tag = r.pass ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    console.log(`${tag} ${c.id.padEnd(9)} ${c.name}${r.detail ? ` — ${r.detail}` : ''}`);
    if (!r.pass) failed++;
  }
  console.log(`\n${checks.length - failed}/${checks.length} invariants passed`);
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
