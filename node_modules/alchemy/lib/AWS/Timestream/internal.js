import { Endpoint } from "@distilled.cloud/aws";
import * as TSQ from "@distilled.cloud/aws/timestream-query";
import * as TSW from "@distilled.cloud/aws/timestream-write";
import * as Effect from "effect/Effect";
// Module-level cache keyed by discovery kind. `DescribeEndpoints` is a cheap
// call but the API asks clients to respect the returned cache period; caching
// also avoids an extra round-trip on every write/query.
const cache = new Map();
/**
 * Discover (and cache) the cell-specific endpoint for `kind`, using the given
 * `DescribeEndpoints` effect. Parameterized over the discovery effect so each
 * caller carries only its own service module's error union — and so binding
 * layers can pass an operation captured via yield-first (`yield* op`) whose
 * calls are requirement-free.
 */
export const discover = (kind, describe) => Effect.gen(function* () {
    const now = Date.now();
    const cached = cache.get(kind);
    if (cached !== undefined && cached.expiresAt > now) {
        return cached.url;
    }
    const response = yield* describe;
    const endpoint = response.Endpoints[0];
    const url = `https://${endpoint.Address}`;
    cache.set(kind, {
        url,
        expiresAt: now + (endpoint.CachePeriodInMinutes ?? 5) * 60_000,
    });
    return url;
});
/**
 * Wrap a distilled Timestream effect so it targets the endpoint produced by
 * `discovered` (see {@link discover}) via the `Endpoint` service override.
 */
export const withEndpoint = (discovered) => (effect) => discovered.pipe(Effect.flatMap((url) => effect.pipe(Effect.provideService(Endpoint.Endpoint, Effect.succeed(url)))));
/**
 * Route a distilled `timestream-write` effect through the discovered ingest
 * endpoint. Adds `DescribeEndpoints`'s error union (including the synthetic
 * `TimestreamNotOnboarded` tag) to the wrapped effect's errors.
 */
export const withWriteEndpoint = withEndpoint(discover("write", TSW.describeEndpoints({})));
/**
 * Route a distilled `timestream-query` effect through the discovered query
 * endpoint.
 */
export const withQueryEndpoint = withEndpoint(discover("query", TSQ.describeEndpoints({})));
//# sourceMappingURL=internal.js.map