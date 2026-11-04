import type * as runtime from "@cloudflare/workers-types";
import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { Credentials } from "../Credentials.ts";
import { type QueryDatabaseClient } from "./QueryDatabase.ts";
/**
 * Injectable auth shared by the Local (current-credentials) impl and a future
 * Http (scoped-token) impl. `authorize` discharges the
 * `Credentials | HttpClient` requirement of a distilled op; `accountId` is the
 * Cloudflare account the ops run against.
 */
export interface D1Auth {
    authorize: <A, E>(eff: Effect.Effect<A, E, Credentials | HttpClient.HttpClient>) => Effect.Effect<A, E>;
    accountId: string;
}
/**
 * Build a {@link QueryDatabaseClient} over the D1 HTTP query API.
 *
 * `databaseId` is an Effect so the resolution stays deferred to each call —
 * inside an Action it resolves through the apply-time RuntimeContext. The
 * credentials are provided ONLY around the distilled op (via `auth.authorize`),
 * never around the id accessor, matching the KV / Vectorize Local variants.
 */
export declare const makeHttpQueryDatabaseClient: (auth: D1Auth, databaseId: Effect.Effect<string>) => QueryDatabaseClient;
/**
 * Build a {@link QueryDatabaseClient} from a deferred `D1Database` — shared
 * by the cloud HTTP transport above and the local-simulator gateway
 * transport (`QueryDatabaseLocal` with a `dev:` id).
 */
export declare const makeQueryDatabaseClientFrom: (rawEff: Effect.Effect<runtime.D1Database>) => QueryDatabaseClient;
/** A `D1Database` facade over the cloud HTTP query API. */
export declare const makeHttpD1Database: (auth: D1Auth, databaseId: string) => runtime.D1Database;
/**
 * The transport a {@link runtime.D1Database} facade is built over: run one
 * query (or batch) and return the D1 result envelope(s). Two transports
 * exist — the cloud HTTP API (`runQuery`) and the local-simulator gateway
 * (`withLocalD1Query`).
 */
export type D1QueryTransport = (body: {
    sql: string;
    params?: unknown[];
} | {
    batch: {
        sql: string;
        params?: unknown[];
    }[];
}) => Promise<{
    result: Array<{
        results?: unknown;
        success?: boolean | null;
        meta?: unknown;
    }>;
}>;
export declare const makeD1DatabaseFromTransport: (transport: D1QueryTransport) => runtime.D1Database;
//# sourceMappingURL=QueryDatabaseHttpClient.d.ts.map