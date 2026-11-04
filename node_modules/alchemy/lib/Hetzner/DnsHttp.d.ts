import { Credentials } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { RuntimeContext } from "../RuntimeContext.ts";
import type { Zone } from "./Zone.ts";
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
export declare const makeHttpDnsBinding: <Client>(options: {
    makeClient: (auth: DnsAuth, zoneId: Effect.Effect<number>) => Client;
}) => Effect.Effect<(zone: Zone) => Effect.Effect<Client, never, never>, never, Credentials | HttpClient.HttpClient>;
/**
 * Injectable auth for the DNS HTTP client builders. Supplies an `authorize`
 * that provides `Credentials` + `HttpClient` to a raw SDK op.
 */
export interface DnsAuth {
    authorize: <A, E>(eff: Effect.Effect<A, E, Credentials | HttpClient.HttpClient>) => Effect.Effect<A, E, RuntimeContext>;
}
//# sourceMappingURL=DnsHttp.d.ts.map