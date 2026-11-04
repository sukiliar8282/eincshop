import * as user from "@distilled.cloud/cloudflare/user";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { type ApiTokenBinding, type Props } from "./Common.ts";
export type UserApiToken = Resource<"Cloudflare.ApiToken.UserApiToken", Props, {
    tokenId: string;
    name: string;
    status: "active" | "disabled" | "expired";
    /**
     * The plaintext token value. Cloudflare returns this only once, on
     * creation, so we persist it here for downstream consumers.
     */
    value: Redacted.Redacted<string>;
}, ApiTokenBinding, Providers>;
/**
 * A Cloudflare user-owned API token (`POST /user/tokens`).
 *
 * User-owned tokens are tied to the authenticated user's identity. They can
 * be created by any authenticated user (including OAuth-derived sessions
 * from `alchemy profile edit`) without needing the account-level
 * `API Tokens > Write` permission, but they are also revoked if the user
 * leaves the account.
 *
 * For CI tokens, prefer {@link AccountApiToken} so the token survives
 * personnel changes.
 *
 * Policy `resources` are passed through verbatim — no `accountId` rewriting
 * is performed because user tokens aren't bound to a single account.
 * ### Creating a Token
 * **Example:** A token bound to the authenticated user
 * ```typescript
 * const token = yield* Cloudflare.ApiToken.UserApiToken("personal-token", {
 *   name: "my-personal-token",
 *   policies: [
 *     {
 *       effect: "allow",
 *       permissionGroups: ["Workers Scripts Read"],
 *       resources: { [`com.cloudflare.api.account.${accountId}`]: "*" },
 *     },
 *   ],
 * });
 * ```
 *
 * ### Attaching Policies via Bindings
 * **Example:** Let a downstream capability contribute its own policies
 * A token can be created with no `policies` of its own; the policies are
 * supplied through its binding contract (see {@link ApiTokenBinding}).
 * ```typescript
 * const token = yield* Cloudflare.ApiToken.UserApiToken("scoped-token");
 *
 * yield* token.bind("MyCapability", {
 *   policies: [
 *     {
 *       effect: "allow",
 *       permissionGroups: ["Workers Scripts Read"],
 *       resources: { [`com.cloudflare.api.account.${accountId}`]: "*" },
 *     },
 *   ],
 * });
 * ```
 *
 * ### Exposing a Token to a Worker
 * **Example:** Read the token value at runtime
 * Bind the token's value output in the Worker's Init phase to get a runtime
 * accessor. Binding it injects a `secret_text` Worker binding; the returned
 * accessor reads it back (as `Redacted`) at runtime.
 * ```typescript
 * // init
 * const value = yield* token.value; // Accessor<Redacted<string>>
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     const apiToken = yield* value; // Redacted<string>
 *     // ... call the Cloudflare API with `apiToken`
 *     return HttpServerResponse.text("ok");
 *   }),
 * };
 * ```
 *
 * @resource
 * @product API Tokens
 * @category Account & Identity
 */
export declare const UserApiToken: import("../../Resource.ts").ResourceClass<UserApiToken>;
export declare const UserApiTokenProvider: () => import("effect/Layer").Layer<Provider.Provider<UserApiToken>, never, import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | user.CloudflareOpContext>;
//# sourceMappingURL=UserApiToken.d.ts.map