# landing-grid-zola — single gate entrypoint.
# Humans and CI both call these targets so "green locally == green in CI".
# Run `make ci` to execute the full gate battery, or an individual gate by name.

SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

ROOT := $(shell pwd)
# Locally-pinned supply-chain binaries (actionlint/gitleaks/hadolint).
export PATH := $(ROOT)/.tools/bin:$(PATH)

# Production base_url (used for the deployable build + SEO invariants).
BASE_URL ?= https://landing-grid.fastup.one
# Local origin for the browser gates (pa11y / Playwright / Lighthouse).
SERVE_URL ?= http://127.0.0.1:8080
SERVE_PORT ?= 8080
# System Chromium (present in this environment); overridable in CI.
CHROMIUM ?= $(shell command -v chromium 2>/dev/null || command -v chromium-browser 2>/dev/null || command -v google-chrome 2>/dev/null || echo chromium)

export PUPPETEER_EXECUTABLE_PATH := $(CHROMIUM)
export CHROME_PATH := $(CHROMIUM)

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
.PHONY: tools
tools: ## Install pinned supply-chain gate binaries into .tools/bin
	bash scripts/install-tools.sh

.PHONY: install
install: ## Reproducible dependency install
	npm ci

.PHONY: css
css: ## Compile the production Tailwind stylesheet
	npm run build-css-prod

.PHONY: build
build: css ## Build the site with the production base_url
	zola build --base-url $(BASE_URL)

.PHONY: build-local
build-local: css ## Build the site pointed at the local serve origin (for browser gates)
	zola build --base-url $(SERVE_URL)

.PHONY: check
check: ## zola check (templates, internal links, anchors)
	zola check

# ---------------------------------------------------------------------------
# Static gates (no browser)
# ---------------------------------------------------------------------------
.PHONY: htmlvalidate
htmlvalidate: css ## Validate a readable (non-minified) build of the HTML
	rm -rf .htmlcheck
	sed 's/^minify_html = true/minify_html = false/' config.toml > .config.htmlcheck.toml
	zola -c .config.htmlcheck.toml build --base-url $(BASE_URL) --output-dir .htmlcheck --force >/dev/null
	rm -f .config.htmlcheck.toml
	npx html-validate ".htmlcheck/**/*.html"

.PHONY: links
links: ## Validate data/links.toml (scheme allowlist, hex colors, required fields)
	node scripts/validate-links.mjs data/links.toml

.PHONY: invariants
invariants: build ## Per-finding no-regression assertions
	node scripts/invariants.mjs

.PHONY: coverage
coverage: ## Prove every audit finding maps to a gate (45/45)
	node scripts/coverage-matrix.mjs

# ---------------------------------------------------------------------------
# Supply-chain gates
# ---------------------------------------------------------------------------
.PHONY: lint-actions
lint-actions: tools ## Lint GitHub Actions workflows
	actionlint

.PHONY: gitleaks
gitleaks: tools ## Scan working tree + history for secrets
	gitleaks detect --no-banner --redact --config .gitleaks.toml

.PHONY: hadolint
hadolint: tools ## Lint the Dockerfile
	hadolint Dockerfile

# ---------------------------------------------------------------------------
# Browser gates (serve built public/ over http, drive headless Chromium)
# ---------------------------------------------------------------------------
.PHONY: pa11y
pa11y: build-local ## Accessibility gate (WCAG2AA, 0 errors)
	node -e 'const c=require("./.pa11yci.json"); c.defaults.chromeLaunchConfig=c.defaults.chromeLaunchConfig||{}; c.defaults.chromeLaunchConfig.executablePath="$(CHROMIUM)"; require("fs").writeFileSync(".pa11yci.runtime.json", JSON.stringify(c));'
	@$(call with_server,npx pa11y-ci --config .pa11yci.runtime.json); status=$$?; rm -f .pa11yci.runtime.json; exit $$status

.PHONY: playwright
playwright: build-local ## Behavior gate (JS correctness specs)
	npx --yes playwright test

.PHONY: lighthouse
lighthouse: build-local ## Performance / SEO / best-practices budgets
	CHROME_PATH="$(CHROMIUM)" npx @lhci/cli autorun

# Serve public/ on SERVE_PORT for the duration of a command, then tear down.
define with_server
	python3 -m http.server $(SERVE_PORT) --directory public --bind 127.0.0.1 >/dev/null 2>&1 & \
	SRV=$$!; trap "kill $$SRV 2>/dev/null || true" EXIT; \
	for i in $$(seq 1 30); do curl -sf -o /dev/null $(SERVE_URL)/ && break || sleep 0.2; done; \
	$(1)
endef

# ---------------------------------------------------------------------------
# Aggregate + hooks
# ---------------------------------------------------------------------------
.PHONY: precommit
precommit: ## Fast pre-commit subset (no browser/docker)
	node scripts/invariants.mjs || true
	node scripts/validate-links.mjs data/links.toml
	zola check
	actionlint
	gitleaks protect --staged --no-banner --redact --config .gitleaks.toml

.PHONY: ci
ci: install build check htmlvalidate links invariants pa11y playwright lighthouse lint-actions gitleaks hadolint coverage ## Full gate battery
	@echo "✅ all gates passed"

.PHONY: clean
clean: ## Remove build output
	npm run clean
