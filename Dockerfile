# ── Stage 1: Vite 빌드 ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# pnpm 활성화 (package.json packageManager 필드 기준)
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

# VITE_API_BASE_URL은 빌드 시 ARG로 주입 → JS 번들에 인라인됨
ARG VITE_API_BASE_URL=https://www.dndn24.kro.kr/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm build

# ── Stage 2: Nginx 정적 파일 서빙 ────────────────────────────────
FROM nginx:1.27-alpine

# Vue Router history 모드 대응 — 모든 경로를 index.html로 fallback
COPY --from=builder /app/dist /usr/share/nginx/html

RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # Vue Router history 모드: 알 수 없는 경로 → index.html\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # 정적 에셋 캐싱\n\
    location /assets/ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    gzip on;\n\
    gzip_types text/plain text/css application/javascript application/json;\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
