import * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import { AccountApiToken } from "../ApiToken/AccountApiToken.ts";
import type { PermissionGroupRef } from "../ApiToken/Common.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Credentials } from "../Credentials.ts";
import { Worker } from "../Workers/Worker.ts";
/**
 * Shared runtime body for a tunnel binding. Mints a scoped
 * {@link AccountApiToken} (with the given permission groups), attaches the
 * narrow allow-policy to it (guarded by the runtime flag so it is a no-op once
 * deployed), binds the token's outputs into the Worker, then builds the client.
 *
 * Pass the result to `Layer.effect(<Callable>, ...)`.
 */
export declare const makeTunnelClient: <C>(sid: string, permissionGroups: PermissionGroupRef[], makeClient: (auth: TunnelAuth) => C) => Effect.Effect<() => Effect.Effect<C, never, Worker<any>>, never, CloudflareEnvironment>;
/**
 * Injectable auth for the tunnel client builders. Both the scoped-token
 * (`*Binding`) and current-credentials (`*Local`) variants supply an
 * `authorize` (which provides `Credentials` + `HttpClient` to a raw SDK op)
 * and an `accountId`, so the client builders are agnostic to how creds are
 * obtained.
 */
export interface TunnelAuth {
    authorize: <A, E>(eff: Effect.Effect<A, E, Credentials | HttpClient.HttpClient>) => Effect.Effect<A, E, RuntimeContext>;
    accountId: Effect.Effect<string>;
}
/** Build a scoped-token {@link TunnelAuth} from a bound {@link Token}. */
export declare const makeTunnelAuth: (token: Token) => TunnelAuth;
/**
 * Runtime accessors for a tunnel binding's token, obtained by binding the
 * {@link AccountApiToken}'s outputs in the Worker's Init phase. Each accessor
 * reads the value back from the Worker's environment at runtime.
 */
export interface Token {
    /** The token's plaintext value (injected as a `secret_text` binding). */
    value: Effect.Effect<Redacted.Redacted<string>>;
    /** The account id the token is scoped to. */
    accountId: Effect.Effect<string>;
}
/**
 * Bind an {@link AccountApiToken}'s outputs into the Worker so they can be read
 * at runtime: `token.value` is injected as a `secret_text` binding and
 * `token.accountId` as `plain_text`. Returns the {@link Token} accessors.
 */
export declare const bindTunnelToken: (token: AccountApiToken) => Effect.Effect<{
    value: import("../../Output.ts").Accessor<Redacted.Redacted<string>>;
    accountId: import("../../Output.ts").Accessor<string>;
}, never, never>;
//# sourceMappingURL=TunnelBinding.d.ts.map