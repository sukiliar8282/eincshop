import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { Credentials } from "../Credentials.ts";
import { type ReadFlagsClient } from "./ReadFlags.ts";
/**
 * Injectable auth shared by the Local (current-credentials) impl and a future
 * Http (scoped-token) impl. `authorize` discharges the
 * `Credentials | HttpClient` requirement of a distilled op; `accountId` is the
 * Cloudflare account the ops run against.
 */
export interface FlagshipAuth {
    authorize: <A, E>(eff: Effect.Effect<A, E, Credentials | HttpClient.HttpClient>) => Effect.Effect<A, E>;
    accountId: string;
}
/**
 * Build a {@link ReadFlagsClient} over the Flagship HTTP evaluate endpoint
 * (`GET .../flagship/apps/{appId}/evaluate`).
 *
 * `appId` is an Effect so the resolution stays deferred to each call — inside
 * an Action it resolves through the apply-time RuntimeContext. Mirrors the
 * Worker binding's fall-back-to-default semantics: evaluation never fails the
 * effect — an HTTP error or a value whose type does not match the requested
 * method resolves to `defaultValue` instead. The `raw` runtime binding has no
 * HTTP equivalent and dies if used.
 */
export declare const makeHttpFlagshipClient: (auth: FlagshipAuth, appId: Effect.Effect<string>) => ReadFlagsClient;
//# sourceMappingURL=ReadFlagsHttpClient.d.ts.map