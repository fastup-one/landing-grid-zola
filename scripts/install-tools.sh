#!/usr/bin/env bash
# Installs pinned copies of the supply-chain gate binaries (actionlint, gitleaks,
# hadolint, shellcheck) into ./.tools/bin so `make` gates run identically locally
# and in CI. shellcheck matters: actionlint auto-runs it on workflow run: scripts,
# so without it local actionlint would miss issues that fail on GitHub runners.
# Idempotent: skips a tool that is already present at the pinned version.
set -euo pipefail

ACTIONLINT_VERSION=1.7.7
GITLEAKS_VERSION=8.21.2
HADOLINT_VERSION=2.12.0
SHELLCHECK_VERSION=0.10.0

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN="$ROOT/.tools/bin"
mkdir -p "$BIN"

os=$(uname -s | tr '[:upper:]' '[:lower:]')   # linux / darwin
arch=$(uname -m)
case "$arch" in
  x86_64|amd64) arch=x86_64; gh_arch=amd64 ;;
  aarch64|arm64) arch=arm64; gh_arch=arm64 ;;
  *) echo "unsupported arch: $arch" >&2; exit 1 ;;
esac

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

have() { "$BIN/$1" --version 2>/dev/null | grep -q "$2"; }

if ! have actionlint "$ACTIONLINT_VERSION"; then
  echo "· actionlint $ACTIONLINT_VERSION"
  curl -sSfL "https://github.com/rhysd/actionlint/releases/download/v${ACTIONLINT_VERSION}/actionlint_${ACTIONLINT_VERSION}_${os}_${gh_arch}.tar.gz" \
    | tar -xz -C "$tmp" actionlint
  install -m755 "$tmp/actionlint" "$BIN/actionlint"
fi

if ! have gitleaks "$GITLEAKS_VERSION"; then
  echo "· gitleaks $GITLEAKS_VERSION"
  # gitleaks asset arch tokens: x64 / arm64
  gl_arch=$([ "$arch" = x86_64 ] && echo x64 || echo arm64)
  curl -sSfL "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_${os}_${gl_arch}.tar.gz" \
    | tar -xz -C "$tmp" gitleaks
  install -m755 "$tmp/gitleaks" "$BIN/gitleaks"
fi

if ! have hadolint "$HADOLINT_VERSION"; then
  echo "· hadolint $HADOLINT_VERSION"
  hd_os=$([ "$os" = darwin ] && echo Darwin || echo Linux)
  curl -sSfL -o "$BIN/hadolint" \
    "https://github.com/hadolint/hadolint/releases/download/v${HADOLINT_VERSION}/hadolint-${hd_os}-${arch}"
  chmod 755 "$BIN/hadolint"
fi

if ! have shellcheck "$SHELLCHECK_VERSION"; then
  echo "· shellcheck $SHELLCHECK_VERSION"
  sc_os=$([ "$os" = darwin ] && echo darwin || echo linux)
  curl -sSfL "https://github.com/koalaman/shellcheck/releases/download/v${SHELLCHECK_VERSION}/shellcheck-v${SHELLCHECK_VERSION}.${sc_os}.${arch}.tar.xz" \
    | tar -xJ -C "$tmp" "shellcheck-v${SHELLCHECK_VERSION}/shellcheck"
  install -m755 "$tmp/shellcheck-v${SHELLCHECK_VERSION}/shellcheck" "$BIN/shellcheck"
fi

echo "tools ready in $BIN"
