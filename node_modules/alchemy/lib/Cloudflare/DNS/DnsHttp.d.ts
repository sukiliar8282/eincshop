import * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import { Self } from "../../Self.ts";
import type { PermissionGroupRef } from "../ApiToken/Common.ts";
import type { Credentials } from "../Credentials.ts";
import type { Zone } from "../Zone/Zone.ts";
/**
 * Shared scaffolding for the HTTP-backed DNS bindings.
 *
 * Creates a least-privilege {@link AccountApiToken} scoped to the requested
 * zone, binds its `value` into the host Worker at deploy time (guarded by
 * `__ALCHEMY_RUNTIME__` so it is a no-op once running inside the deployed
 * Worker), then delegates to `makeClient` with the bound token and the zone's
 * `zoneId`.
 *
 * The zone's `zoneId` is bound into the Worker at init time, so the resulting
 * client closes over it and callers never pass it per request — the
 * provisioned token only grants access to that one zone anyway.
 */
export declare const makeHttpDnsBinding: <Client>(options: {
    permissionGroups: PermissionGroupRef[];
    makeClient: (auth: DnsAuth, zoneId: Effect.Effect<string>) => Client;
}) => Effect.Effect<(zone: Zone) => Effect.Effect<Client, never, never>, never, Self<{
    Type: string;
    LogicalId: string;
}>>;
/**
 * Injectable auth for the DNS HTTP client builders. Both the scoped-token
 * (`*Http`) and current-credentials (`*Local`) variants supply an `authorize`
 * that provides `Credentials` + `HttpClient` to a raw SDK op, so the client
 * builders are agnostic to how creds are obtained. DNS record ops are
 * zone-scoped (the `zoneId` is passed alongside), so no `accountId` is needed.
 */
export interface DnsAuth {
    authorize: <A, E>(eff: Effect.Effect<A, E, Credentials | HttpClient.HttpClient>) => Effect.Effect<A, E, RuntimeContext>;
}
/** Build a scoped-token {@link DnsAuth} from a bound {@link Token}. */
export declare const makeDnsAuth: (token: Token) => DnsAuth;
/**
 * Runtime accessor for a DNS binding's token, obtained by binding the
 * {@link AccountApiToken}'s `value` output in the Worker's Init phase. Reads the
 * value back from the Worker's environment at runtime. DNS record operations
 * are zone-scoped (the `zoneId` is passed per call), so the account id is not
 * needed at runtime.
 */
export interface Token {
    /** The token's plaintext value (injected as a `secret_text` binding). */
    value: Effect.Effect<Redacted.Redacted<string>>;
}
//# sourceMappingURL=DnsHttp.d.ts.map