# docs-service on Railway

## Runtime
- Node.js >= 20
- Start command: `npm run start`
- Build command: `npm run build`

## Required Vars
- `NODE_ENV=production`
- `PORT=3005`

## Healthcheck
- Path: `/api/health`

## Smoke
1. Open `/docs`.
2. Open `/docs/reference`.
3. Confirm `/api/health` returns HTTP 200.
