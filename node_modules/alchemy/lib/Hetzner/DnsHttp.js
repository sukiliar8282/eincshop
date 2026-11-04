import { Credentials } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
/**
 * Shared scaffolding for the HTTP-backed Hetzner DNS bindings.
 *
 * Hetzner Cloud tokens are project-scoped (`HCLOUD_TOKEN`) and issued
 * read-write or read-only — there is no per-permission token API. This
 * layer captures the ambient credentials available during stack-eval and
 * builds a {@link DnsAuth} that provides them to distilled RRSet ops. The
 * zone is fixed at `bind(zone)` time so callers never pass `id_or_name`.
 *
 * NOT exported from `index.ts`.
 */
export const makeHttpDnsBinding = (options) => Effect.gen(function* () {
    const context = yield* Effect.context();
    return Effect.fn(function* (zone) {
        const zoneId = yield* zone.zoneId;
        const auth = {
            authorize: (eff) => eff.pipe(Effect.provideContext(context)),
        };
        return options.makeClient(auth, zoneId);
    });
});
//# sourceMappingURL=DnsHttp.js.map