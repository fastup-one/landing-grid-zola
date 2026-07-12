# Changelog

All notable changes to this project are documented here. Versions follow
[Semantic Versioning](https://semver.org/). Tag a release as `vX.Y.Z` matching
the `version` in `package.json` (enforced by `.github/workflows/release.yml`).

## [Unreleased]

### Changed — industrialization pass
- Migrated styling to **Tailwind v4** (CSS-first `@theme`); fixed the broken
  `@apply group` build and removed the Tailwind Play CDN.
- Self-hosted fonts (Inter, JetBrains Mono) and replaced Font Awesome with inline
  SVG icons — no third-party runtime dependencies.
- Added a Content-Security-Policy (meta for Pages, headers for nginx) and
  build-time validation of `data/links.toml` (URL scheme + hex colors).
- Restored a hardened multi-stage Docker/nginx deployment (digest-pinned images,
  read-only rootfs, dropped capabilities, security headers).
- Rebuilt CI: PR gate battery (build, `zola check`, html-validate, pa11y,
  Playwright, Lighthouse, invariants, actionlint, gitleaks, hadolint, coverage),
  SHA-pinned deploy workflow with least-privilege permissions, and Dependabot.
- Accessibility and JS correctness fixes across the grid, search, and navigation.
- SEO metadata, favicon, themed 404, and `page`/`section` templates.

## [1.0.0]
- Initial landing-grid theme.
