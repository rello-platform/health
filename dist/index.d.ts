import type { EngineSlug } from "@rello-platform/slugs";
/** Common base shape — every engine emits these core fields. */
interface BaseEngineHealth {
    status: "healthy" | "degraded" | "unhealthy";
    version: string;
    commit: string;
    uptime: number;
    checks: HealthChecks;
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