# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY Backend/package*.json ./
RUN npm ci --only=production

# Stage 2: Production image
FROM node:20-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy backend source
COPY Backend/ ./

# Copy frontend
COPY Frontend/ ./Frontend/

# Environment
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

CMD ["node", "index.js"]