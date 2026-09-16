# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Valeur bidon pour que le build passe (la vraie valeur vient de l'environnement au
# runtime) — non utilisée au build, uniquement pour satisfaire le check "variable
# manquante" de lib/auth.ts au module-load. src/lib/db/client.ts (Supabase) ne lève son
# erreur qu'au premier appel réel, pas à l'import — pas besoin de placeholder pour lui.
ENV JWT_SECRET=build-placeholder
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
