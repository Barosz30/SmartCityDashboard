# Delivery Phases

## Phase 1 - Foundation

- Initialize React dashboard shell
- Add KPI cards, map panel placeholder, and time scrubber
- Use mock telemetry and mock alerts

## Phase 2 - Realtime + Alerts

- Add SSE/WebSocket event stream
- Push new readings and alerts to UI
- Add alert acknowledge/resolution flow

## Phase 3 - History + Drill-down

- Add aggregated intervals `1m`, `5m`, `1h`
- Enable zone comparison and expanded detail panels
- Add historical timeline controls for 24h/7d

## Phase 4 - Hardening

- Add tests (frontend + backend)
- Optimize rendering and network payloads
- Prepare staging deployment and CI gates

## Acceptance Criteria

- Dashboard can detect, localize, and analyze incidents
- Filters are synchronized across KPI, map, chart, and alert center
- Build and typecheck pass
