# @rello-platform/health

Canonical `EngineHealthResponse` discriminated-union types for the Rello ecosystem's six platform-service engines: Milo, Content, Property, Journey, Report, and Drumbeat-Video.

Every engine's `/api/health` (or `/health` for FastAPI) endpoint emits a payload that conforms to this contract. Every Rello-side reader (the `/api/admin/engines/health` aggregator, the §4g Top page, the §4g Tab 4 Services sub-sections, the EngineHealthBadge component) imports the type from this package — never redeclares.

## Install

```bash
npm install github:rello-platform/health#v0.1.0
```

This package is consumed via GitHub-tag-pinned install (mirrors `@rello-platform/slugs` convention). Tags are SemVer-style.

Peer dependency: `@rello-platform/slugs ^0.3.2` for the `EngineSlug` union used in `EngineUnreachable.app`.

## Usage

```ts
import type {
  EngineHealthResponse,
  EngineUnreachable,
  EngineHealthOrUnreachable,
  MiloEngineMetrics,
  ContentEngineMetrics,
  PropertyEngineMetrics,
  JourneyEngineMetrics,
  ReportEngineMetrics,
  DVEMetrics,
} from "@rello-platform/health";

function renderEngine(payload: EngineHealthResponse) {
  switch (payload.app) {
    case "milo-engine":
      // payload.engineMetrics is MiloEngineMetrics | undefined
      return payload.engineMetrics?.decisionsToday ?? 0;
    case "drumbeat-video-engine":
      return payload.engineMetrics?.queueCounts.QUEUED ?? 0;
    // ... five-case exhaustive check
  }
}
```

## Shape

`EngineHealthResponse` is discriminated by the `app` field — each engine carries:

- Common fields: `status`, `version`, `commit`, `uptime`, `checks`.
- `engineMetrics`: per-engine optional shape (`MiloEngineMetrics`, `ContentEngineMetrics`, `PropertyEngineMetrics`, `JourneyEngineMetrics`, `ReportEngineMetrics`, `DVEMetrics`).

`EngineUnreachable` is the aggregator-side fallback when a fan-out fetch fails — it carries `status: "unreachable"`, `app`, `lastError`, `attemptedAt`. `EngineHealthOrUnreachable` is the union both readers narrow over.

## Authoring contract

Every engine that adds a metric to its `/health` payload extends the per-engine `*Metrics` interface in this package — open a PR against `src/index.ts`, bump the SemVer minor, and re-pin downstream consumers. Per Class-Level Rule E, no consumer hand-redeclares this shape.

## Provenance

Authored 2026-05-05 as the foundation contract for `SPEC-§4g-TOP-HEALTH-CONTRACT.md` (Rello platform-admin §4g Top Remainder build). Discriminated-union shape locked at Q7.3 lock #1 of the §4g Engines spec ANSWERS.md.
