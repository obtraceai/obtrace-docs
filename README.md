# docs-service

Standalone docs service using:
- Next.js
- Fumadocs

Current docs runtime:
- `DocsLayout` from `fumadocs-ui/layouts/docs`
- `DocsPage` from `fumadocs-ui/page`
- MDX source loader from `fumadocs-core/source`

Requirements reference:
- `docs/requirements-docs-service-v1.md`

## Run

```bash
npm install
npm run dev
```

Open:
- http://127.0.0.1:3005/docs
- http://127.0.0.1:3005/docs/reference

## Production

Requirements:
- Node.js >= 20

Health endpoint:
- `GET /api/health`

Build/start:

```bash
npm run build
npm run start
```

Container:

```bash
docker build -t obtrace/docs-service:local docs-service
docker run --rm -p 3005:3005 obtrace/docs-service:local
```

Deploy references:
- `deploy/k8s/docs-service.deployment.yaml`
- `deploy/railway/README.md`
