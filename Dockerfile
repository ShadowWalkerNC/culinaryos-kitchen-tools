# Public stateless runtime only. No DB mount, no workspace, no secrets.
FROM node:24-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY src/ ./src/
COPY ui/ ./ui/
COPY scripts/ ./scripts/
COPY skills/ ./skills/
COPY tsconfig.json ./
RUN npm run build && npm prune --omit=dev
COPY LICENSE ./LICENSE
ENV NODE_ENV=production PORT=3102
EXPOSE 3102
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "dist/cli/cli.js", "public-serve"]
