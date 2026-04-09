# Smart City Dashboard

Smart City dashboard MVP built with React 19, TypeScript, and Vite.

## Implemented Scope

- Interactive dashboard shell with modern layout
- Layers: air, traffic, noise, energy
- KPI cards for active alerts, response time, uptime, and layer average
- Alert center with status filtering
- Time scrubber (1h to 48h) and trend chart
- Zone drill-down with GeoJSON-backed zone data

## Project Structure

- `src/` frontend app and data contracts
- `docs/data-contracts.md` telemetry, alerts, and GeoJSON schema
- `docs/architecture.md` architecture diagram and API surface
- `docs/delivery-phases.md` 4 implementation phases + acceptance criteria
- `server/src/api-spec.md` backend endpoint and SSE event spec

## Run

```bash
npm install
npm run dev:server
npm run dev
```

The frontend uses Vite proxy for `/api` -> `http://localhost:4000`.

## Build

```bash
npm run typecheck
npm run build
```

## CI/CD

- CI workflow (`.github/workflows/ci.yml`) runs on push/PR to `main` or `master`:
  - lint
  - typecheck
  - unit tests (Vitest)
  - build
- E2E workflow (`.github/workflows/playwright.yml`) runs Playwright tests with report artifact.
- CD workflow (`.github/workflows/cd.yml`) deploys over SSH:
  - `staging` environment deploy after successful CI on `main`/`master`
  - `production` environment deploy after staging (recommended with manual approval in GitHub Environments)

Required GitHub repository secrets for CD:

- `STAGING_SSH_HOST`
- `STAGING_SSH_USER`
- `STAGING_SSH_KEY`
- `STAGING_DEPLOY_PATH`
- `PROD_SSH_HOST`
- `PROD_SSH_USER`
- `PROD_SSH_KEY`
- `PROD_DEPLOY_PATH`

## Realtime + Alert Actions

- SSE stream endpoint: `GET /api/events`
- Sensor updates event: `sensor.update`
- Alert create/update events: `alert.created`, `alert.updated`
- Alert action endpoint: `PATCH /api/alerts/:id` with body `{ "status": "acknowledged" | "resolved" }`

