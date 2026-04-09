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

## Realtime + Alert Actions

- SSE stream endpoint: `GET /api/events`
- Sensor updates event: `sensor.update`
- Alert create/update events: `alert.created`, `alert.updated`
- Alert action endpoint: `PATCH /api/alerts/:id` with body `{ "status": "acknowledged" | "resolved" }`

