# syntax=docker/dockerfile:1
# Multi-stage build: compile CSS + render the Zola site, then serve the static
# output from a hardened nginx. Base images are pinned by digest; the Zola binary
# is pinned by version AND sha256 (findings OPS-03, OPS-04, SUP-04).

# ---- build stage (glibc, so the -gnu Zola binary runs on both amd64/arm64) ----
FROM node:22-bookworm-slim@sha256:53ada149d435c38b14476cb57e4a7da73c15595aba79bd6971b547ceb6d018bf AS builder
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ARG ZOLA_VERSION=0.22.1
ARG BASE_URL=https://landing-grid.fastup.one
ENV ZOLA_SHA256_X86_64=0ca09aa40376aaa9ddfb512ff9ad963262ef95edb0d0f2d5ec6961b6f5cf22ef \
    ZOLA_SHA256_AARCH64=8af437ec6352f33ccd24d7a1cfcb54a3db95d3ce376dc69525b4ef3fb6b8c1d1

# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN arch="$(uname -m)"; \
    case "$arch" in \
      x86_64)  za=x86_64;  sha="$ZOLA_SHA256_X86_64" ;; \
      aarch64) za=aarch64; sha="$ZOLA_SHA256_AARCH64" ;; \
      *) echo "unsupported arch: $arch" >&2; exit 1 ;; \
    esac; \
    curl -sSfL "https://github.com/getzola/zola/releases/download/v${ZOLA_VERSION}/zola-v${ZOLA_VERSION}-${za}-unknown-linux-gnu.tar.gz" -o /tmp/zola.tar.gz; \
    echo "${sha}  /tmp/zola.tar.gz" | sha256sum -c -; \
    tar -xzf /tmp/zola.tar.gz -C /usr/local/bin zola; \
    rm /tmp/zola.tar.gz; \
    zola --version

WORKDIR /app
COPY package.json package-lock.json .npmrc ./
# Only production deps are needed to build (Tailwind CLI + plugins); the gate
# tooling (Playwright/pa11y/etc.) stays out of the image.
RUN npm ci --omit=dev
COPY . .
RUN npm run build-css-prod \
    && zola build --minify --base-url "${BASE_URL}"

# ---- serve stage ----
FROM nginx:1.27-alpine@sha256:65645c7bb6a0661892a8b03b89d0743208a18dd2f3f17a54ef4b76fb8e2f2a10 AS runtime

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/public /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
