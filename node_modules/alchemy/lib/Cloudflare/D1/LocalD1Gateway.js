/**
 * Node-side query path into the local workerd D1 simulator, built on the
 * runtime's platform proxy (`PlatformProxy.open` — our `getPlatformProxy`).
 *
 * The simulator (a `d1` service routing to a per-database
 * `D1DatabaseObject` Durable Object over DO SQLite) is only reachable from
 * inside workerd — but alchemy's migration runner and the
 * `QueryDatabaseLocal` capability run in Node. The platform proxy bridges
 * the two: it hosts the binding in a scoped workerd instance and exposes it
 * to Node. We bind the raw `d1` service (the same designator the
 * `cloudflare-internal:d1-api` wrapped binding targets) so Node speaks the
 * full D1 HTTP protocol (`POST /query`, multi-statement SQL) rather than
 * the line-based `exec()` surface of the wrapped binding:
 *
 *   Node ── proxy.env.D1_RAW.fetch({sql}) ──▶ `d1` service ──▶ D1DatabaseObject
 *
 * Data lands in the same `{storage}/d1` directory every local worker
 * binding reads.
 *
 * NOT exported from `index.ts` — provider-internal scaffolding.
 */
import { open } from "@alchemy.run/cloudflare-runtime/core/platform-proxy";
import { D1 } from "@alchemy.run/cloudflare-runtime/core/bindings";
import { SERVICE_D1 } from "@alchemy.run/cloudflare-runtime/core/bindings/d1/D1Options";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { gatewayName, localGatewayRuntime } from "../LocalGateway.js";
export { localGatewayRuntime as localD1GatewayRuntime };
export class LocalD1QueryError extends Data.TaggedError("LocalD1QueryError") {
}
/**
 * A plain service binding onto the raw `d1` service for `databaseId` —
 * bypassing the `cloudflare-internal:d1-api` wrapper so the proxy's fetch
 * passthrough can POST the full D1 HTTP protocol.
 */
const rawD1Binding = (databaseId) => Effect.succeed({
    name: "D1_RAW",
    service: {
        name: SERVICE_D1,
        props: { json: JSON.stringify({ databaseId }) },
    },
});
/**
 * Boot a scoped platform proxy for `databaseId`, hand `use` a query
 * function that tunnels {@link D1QueryBody} requests into the local
 * simulator, and tear the instance down when `use` completes.
 */
export const withLocalD1Query = (databaseId, use) => Effect.scoped(Effect.gen(function* () {
    const proxy = yield* open({
        name: gatewayName("alchemy-d1-gateway", databaseId),
        bindings: [
            // The wrapped binding is unused by the gateway itself, but its
            // hook registers the database with the D1 plugin so the `d1`
            // service is emitted into this workerd config.
            D1.local({ binding: "DB", id: databaseId }),
            rawD1Binding(databaseId),
        ],
    });
    const raw = proxy.env.D1_RAW;
    const query = (body) => Effect.tryPromise({
        try: async () => {
            const response = await raw.fetch("http://d1/query", {
                method: "POST",
                headers: { "content-type": "application/json" },
                // The DO accepts a single D1Query or an array (one
                // transaction) — a batch maps to the array form.
                body: JSON.stringify("batch" in body ? body.batch : body),
            });
            return (await response.json());
        },
        catch: (cause) => new LocalD1QueryError({
            message: "Failed to reach the local D1 gateway",
            cause,
        }),
    }).pipe(Effect.flatMap((responseBody) => {
        // Protocol errors come back `{ success: false, error }` (a
        // single object); successes are one envelope per statement.
        const responses = (Array.isArray(responseBody) ? responseBody : [responseBody]);
        const failed = responses.find((r) => !r.success);
        if (failed) {
            return Effect.fail(new LocalD1QueryError({
                message: failed.error ?? "Local D1 query failed",
            }));
        }
        return Effect.succeed({
            result: responses.map((r) => ({
                results: r.results,
                success: true,
                meta: r.meta,
            })),
        });
    }));
    return yield* use(query);
}));
/**
 * SQL-only view of {@link withLocalD1Query} matching the migration flow's
 * {@link D1SqlExecutor} contract.
 */
export const withLocalD1Executor = (databaseId, use) => withLocalD1Query(databaseId, (query) => use((sql) => query({ sql })));
//# sourceMappingURL=LocalD1Gateway.js.map