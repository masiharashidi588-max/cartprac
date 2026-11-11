# MaxSmpPlugin configuration bridge

This folder contains the public configuration source and the Worker that serves it.

## Files

- `bridge.json` — settings read by MaxSmpPlugin.
- `worker.js` — source for the read-only Cloudflare Worker.

The Worker exposes:

- `GET /health` — confirms the bridge service is reachable.
- `GET /api/config` — returns the current `bridge.json`.
- `HEAD /api/config` and `OPTIONS` — health/preflight support.

The Worker does not accept writes, execute remote code, or store credentials. It reads the JSON file from this branch and returns it.

## Updating settings

1. Edit `bridge.json` on the `maxsmp-event-bridge` branch.
2. Increase the numeric `revision` value for every published edit.
3. Keep `schemaVersion` at `1`.
4. Use only the listed modifier and disaster IDs. The plugin also validates values and clamps numeric settings locally.

The plugin checks for a new revision about every 150 seconds. A new setting is used by the next event start; an already-running event keeps the settings it started with.

## Current event groups

- **Natural Disasters:** phase length, arena size/shrink, concurrent hazards, and per-hazard warning/interval times.
- **Control Points:** point pool, simultaneously open points, capture goal, control/capture timers and progress decay.
- **Chaos:** total duration, modifier rotation interval and the allowlisted named modifiers.
- **Tag Pursuers:** maximum count, one-per-participant behavior and path refresh interval.

Pursuers are intentionally non-damaging tag-chasers. The plugin hard-codes player damage and temporary web placement off regardless of values in the JSON.

## Public endpoints

- Bridge health: https://maxsmp-config-bridge.masiharashidi588.workers.dev/health
- Current settings: https://maxsmp-config-bridge.masiharashidi588.workers.dev/api/config
- Companion dashboard: https://max-smp-events-qxxg7f.v2.appdeploy.ai/

The dashboard is read-only. It displays the public settings and has a visible local offline-demo mode.
