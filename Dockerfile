# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Valeurs bidons pour que le build passe (les vraies valeurs viennent de l'environnement
# au runtime) — aucune n'est utilisée au build, uniquement pour satisfaire les checks
# "variable manquante" des libs important au module-load (lib/auth.ts, lib/mongodb.ts).
ENV JWT_SECRET=build-placeholder
ENV MONGODB_URI=mongodb://placeholder:27017/placeholder
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
