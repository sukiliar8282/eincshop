import * as accounts from "@distilled.cloud/cloudflare/accounts";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import { type ApiTokenBinding, type Props } from "./Common.ts";
export type AccountApiToken = Resource<"Cloudflare.ApiToken.AccountApiToken", Props, {
    tokenId: string;
    name: string;
    status: "active" | "disabled" | "expired";
    /**
     * The plaintext token value. Cloudflare returns this only once, on
     * creation, so we persist it here for downstream consumers (e.g. a
     * GitHub Actions secret).
     */
    value: Redacted.Redacted<string>;
    accountId: string;
}, ApiTokenBinding, Providers>;
/**
 * A Cloudflare account-owned API token (`POST /accounts/{account_id}/tokens`).
 *
 * Account-owned tokens are managed at the account level and persist
 * independently of any single user. Use these for CI tokens, third-party
 * integrations, or anywhere the token should outlive an individual user's
 * session.
 *
 * Creating account-owned tokens requires the caller to have the
 * `API Tokens > Write` account permission.
 * ### Creating a Token
 * **Example:** A token for managing Workers and KV from CI
 * ```typescript
 * // the account ID resolves from the profile you're deploying with
 * const { accountId } = yield* yield* Cloudflare.CloudflareEnvironment;
 *
 * const token = yield* Cloudflare.ApiToken.AccountApiToken("ci-token", {
 *   name: "my-ci-token",
 *   accountId,
 *   policies: [
 *     {
 *       effect: "allow",
 *       permissionGroups: [
 *         "Workers Scripts Write",
 *         "Workers KV Storage Write",
 *       ],
 *       resources: { [`com.cloudflare.api.account.${accountId}`]: "*" },
 *     },
 *   ],
 * });
 *
 * yield* GitHub.Secret("cf-api-token", {
 *   owner: "me",
 *   repository: "my-repo",
 *   name: "CLOUDFLARE_API_TOKEN",
 *   value: token.value,
 * });
 * ```
 *
 * ### Attaching Policies via Bindings
 * **Example:** Let a downstream capability contribute its own policies
 * A token can be created with no `policies` of its own; the policies are
 * supplied through its binding contract (see {@link ApiTokenBinding}). This is
 * how capabilities like {@link CreateTunnel} provision a least-privilege token.
 * ```typescript
 * const token = yield* Cloudflare.ApiToken.AccountApiToken("scoped-token");
 *
 * yield* token.bind("MyCapability", {
 *   policies: [
 *     {
 *       effect: "allow",
 *       permissionGroups: ["Cloudflare Tunnel Write"],
 *       resources: { [`com.cloudflare.api.account.${accountId}`]: "*" },
 *     },
 *   ],
 * });
 * ```
 *
 * ### Exposing a Token to a Worker
 * **Example:** Read the token value at runtime
 * Bind the token's outputs in the Worker's Init phase to get runtime
 * accessors. Binding `token.value` injects it as a `secret_text` Worker
 * binding; the returned accessor reads it back (as `Redacted`) at runtime.
 * ```typescript
 * // init
 * const value = yield* token.value; // Accessor<Redacted<string>>
 * const accountId = yield* token.accountId; // Accessor<string>
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
export declare const AccountApiToken: import("../../Resource.ts").ResourceClass<AccountApiToken>;
export declare const AccountApiTokenProvider: () => import("effect/Layer").Layer<Provider.Provider<AccountApiToken>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | accounts.CloudflareOpContext>;
//# sourceMappingURL=AccountApiToken.d.ts.map