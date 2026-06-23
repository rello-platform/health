import type { EngineSlug } from "@rello-platform/slugs";
/** Common base shape — every engine emits these core fields. */
interface BaseEngineHealth {
    status: "healthy" | "degraded" | "unhealthy";
    version: string;
    commit: string;
    uptime: number;
    checks: HealthChecks;
    /**
     * OPTIONAL durable-jobs (`@rello-platform/durable-jobs`) queue health.
     * Carried on the base (not a new `app` arm) so any engine OR spoke `/api/health`
     * payload MAY report its bulk-ops queue depth + DLQ without forking the union
     * (Pillar-4 design W-P4). Absent on payloads that run no durable-jobs drains.
     */
    bulkOps?: BulkOpsMetrics;
}
export interface HealthChecks {
    database?: {
        status: "connected" | "disconnected";
        latencyMs?: number;
    };
    [key: string]: unknown;
}
export interface MiloEngineMetrics {
    decisionsToday: number;
    decisionsTotal: number;
    avgLatencyMs: number;
    errorRate24h: number;
    cacheHitRate: number;
    costToday: number;
    costMonth: number;
}
export interface ContentEngineMetrics {
    pendingRelloSync: number;
    failedSignals: number;
    deadLetteredLeads: number;
}
export interface PropertyEngineMetrics {
    mlsSyncLagMs: number;
    propertyLookupCount24h: number;
    failedLookups24h: number;
}
export interface JourneyEngineMetrics {
    queueDepth: number;
    activeEnrollments: number;
    lastExecutionAt: string | null;
    failedExecutionsLastHour: number;
}
export interface ReportEngineMetrics {
    pdfsGenerated24h: number;
    avgGenerationMs: number;
    errorRate: number;
    pendingReports: number;
}
export interface DVEMetrics {
    queueCounts: {
        QUEUED: number;
        PROCESSING: number;
        READY: number;
        FAILED: number;
    };
    avgProcessingTimeMs: number;
    r2UsageMb: number;
    stuckCount: number;
    oldestStuckJobAt: string | null;
}
/**
 * Durable-jobs (`@rello-platform/durable-jobs`) queue health for a SPOKE.
 *
 * Bulk-ops runs INSIDE spokes (Rello, Harvest-Home, …), not as a standalone
 * deployable engine — so this is NOT a new `app` arm on the union. It is an
 * OPTIONAL sub-object (`bulkOps?`) carried by `BaseEngineHealth`, so any health
 * payload (engine OR spoke `/api/health`) MAY report its durable-jobs queue
 * health without forking the union (Pillar-4 design W-P4, the per-spoke
 * sub-object recommendation; mirrors the `DVEMetrics.queueCounts` lock rather
 * than duplicating it).
 *
 * `queueCounts` mirrors the `DVEMetrics.queueCounts` precedent EXACTLY in
 * shape (a status→count record), but the status vocabulary is the canonical
 * `@rello-platform/durable-jobs` `BulkOpStatus` terminal set the drains write
 * (PENDING / PROCESSING / COMPLETED / FAILED / DEAD_LETTER). `FAILED` =
 * transient-budget-exhausted terminal; `DEAD_LETTER` = must-never-drop terminal
 * (surfaced, never hidden — the DLQ). The two non-terminal-but-counted statuses
 * the package also defines (`WAITING`, `EMPTY`) are intentionally folded:
 * `WAITING` (released-for-retry) counts under `PENDING` for the operator view,
 * and `EMPTY` (terminal no-op) is not surfaced as a queue level.
 */
export interface BulkOpsMetrics {
    /**
     * Per-status row counts SUMMED across every durable-jobs intent surface the
     * spoke owns (count-first — cheap aggregate `count`, never a per-row scan).
     *   - PENDING:     intents awaiting/released-for drain (PENDING + WAITING)
     *   - PROCESSING:  intents a runner has claimed; work in flight
     *   - COMPLETED:   terminal success
     *   - FAILED:      transient-retries exhausted → terminal FAILED
     *   - DEAD_LETTER: must-never-drop row exhausted → the DLQ (surfaced)
     */
    queueCounts: {
        PENDING: number;
        PROCESSING: number;
        COMPLETED: number;
        FAILED: number;
        DEAD_LETTER: number;
    };
    /** DEAD_LETTER count specifically (must-never-drop) — the DLQ depth the alert thresholds on. */
    deadLetterCount: number;
    /**
     * ISO timestamp of the oldest intent still in flight (stale-claim sentinel).
     * Null when nothing is in flight. An oldest-in-flight aging past the drain's
     * claim-TTL is the operator signal a drain is wedged.
     */
    oldestStuckOperationAt: string | null;
}
/**
 * Discriminated union — `app` field is the discriminator. Type narrowing in consumers
 * uses the `app` field; per-engine metrics live under `engineMetrics`.
 */
export type EngineHealthResponse = (BaseEngineHealth & {
    app: "milo-engine";
    engineMetrics?: MiloEngineMetrics;
}) | (BaseEngineHealth & {
    app: "content-engine";
    engineMetrics?: ContentEngineMetrics;
}) | (BaseEngineHealth & {
    app: "property-engine";
    engineMetrics?: PropertyEngineMetrics;
}) | (BaseEngineHealth & {
    app: "journey-engine";
    engineMetrics?: JourneyEngineMetrics;
}) | (BaseEngineHealth & {
    app: "report-engine";
    engineMetrics?: ReportEngineMetrics;
}) | (BaseEngineHealth & {
    app: "drumbeat-video-engine";
    engineMetrics?: DVEMetrics;
});
/**
 * Aggregator-side shape for an engine that timed out or rejected the call. NOT engine-emitted —
 * emitted by the Rello aggregator at /api/admin/engines/health when a fan-out call fails.
 */
export interface EngineUnreachable {
    status: "unreachable";
    app: EngineSlug;
    lastError: string;
    attemptedAt: string;
}
/**
 * Aggregator response — six entries keyed by EngineSlug. Each value is either a real
 * EngineHealthResponse OR an EngineUnreachable. Discriminated by `status` first, then `app`.
 */
export type EngineHealthOrUnreachable = EngineHealthResponse | EngineUnreachable;
export {};
//# sourceMappingURL=index.d.ts.map