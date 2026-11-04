import * as workers from "@distilled.cloud/cloudflare/workers";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Socket from "effect/unstable/socket/Socket";
import type { LogLine, LogsInput } from "../Provider.ts";
export interface TelemetryFilter {
    key: string;
    operation: "eq" | "neq" | "includes" | "not_includes" | "starts_with" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in";
    type: "string" | "number" | "boolean";
    value?: string | number | boolean;
}
export declare const CloudflareLogs: Effect.Effect<{
    queryLogs: (opts: {
        accountId: string;
        filters: TelemetryFilter[];
        options: LogsInput;
    }) => Effect.Effect<LogLine[], workers.QueryObservabilityTelemetryError, never>;
    tailScript: (opts: {
        accountId: string;
        scriptName: string;
    }) => Stream.Stream<LogLine, workers.CreateScriptTailError, Socket.WebSocketConstructor>;
    tailStream: (opts: {
        accountId: string;
        filters: TelemetryFilter[];
    }) => Stream.Stream<LogLine, any, never>;
}, never, workers.CloudflareOpContext>;
//# sourceMappingURL=Logs.d.ts.map