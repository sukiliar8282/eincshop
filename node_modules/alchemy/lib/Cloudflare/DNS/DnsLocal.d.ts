import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { Credentials } from "../Credentials.ts";
import type { Zone } from "../Zone/Zone.ts";
import type { DnsAuth } from "./DnsHttp.ts";
/**
 * Shared scaffolding for the `*Local` DNS services.
 *
 * Instead of minting a scoped {@link AccountApiToken} (the `*Http` path), it
 * captures the ambient current-credentials context available during stack-eval
 * and builds a {@link DnsAuth} that provides those credentials directly to the
 * DNS HTTP ops. It then delegates to the same client builders the `*Http`
 * variant uses. DNS is a zone-management capability with no native Worker
 * binding, so there is no `*Binding` counterpart.
 *
 * NOT exported from `index.ts` — this is internal scaffolding shared by the
 * three access-level Local layers.
 */
export declare const makeLocalDnsBinding: <Client>(options: {
    makeClient: (auth: DnsAuth, zoneId: Effect.Effect<string>) => Client;
}) => Effect.Effect<(zone: Zone) => Effect.Effect<Client, never, never>, never, Credentials | HttpClient.HttpClient>;
//# sourceMappingURL=DnsLocal.d.ts.map