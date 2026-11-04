import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type ServiceTokenProps = {
    /**
     * Display name for the service token. Used as a stable identifier so the
     * provider can locate the token by name during adoption / state recovery.
     * If omitted, a unique name is generated from the stack/stage/logical id.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * How long the service token is valid. Must be in the format `300ms` or
     * `2h45m`. Valid time units are: ns, us (or µs), ms, s, m, h.
     *
     * @default "8760h" (1 year)
     */
    duration?: string;
    /**
     * A version number identifying the current client secret. Incrementing it
     * triggers a rotation — a new client secret is generated and the previous
     * secret remains valid until `previousClientSecretExpiresAt`.
     *
     * @default 1
     */
    clientSecretVersion?: number;
    /**
     * The expiration of the previous client secret (RFC3339 timestamp). Only
     * meaningful after a rotation; may be extended to give consumers more
     * time to roll over to the new secret.
     */
    previousClientSecretExpiresAt?: string;
};
export type ServiceToken = Resource<"Cloudflare.Access.ServiceToken", ServiceTokenProps, {
    /** UUID of the service token assigned by Cloudflare. */
    serviceTokenId: string;
    /** Cloudflare account that owns the service token. */
    accountId: string;
    /** Client ID sent in the `CF-Access-Client-ID` request header. */
    clientId: string;
    /**
     * Client secret sent in the `CF-Access-Client-Secret` request header.
     * Cloudflare only returns it on create and rotate, so the provider
     * persists it (redacted) and carries it forward on read.
     */
    clientSecret: Redacted.Redacted<string> | undefined;
    /** Display name reported by Cloudflare. */
    name: string;
    /** Validity duration reported by Cloudflare, e.g. `8760h`. */
    duration: string | undefined;
    /** Expiration timestamp of the current client secret. */
    expiresAt: string | undefined;
    /** The client secret version this token was last reconciled to. */
    clientSecretVersion: number;
}, never, Providers>;
/**
 * A Cloudflare Zero Trust Access service token. Service tokens let
 * machine-to-machine clients authenticate to Access-protected applications
 * by sending the `CF-Access-Client-ID` / `CF-Access-Client-Secret` headers.
 *
 * The client secret is only revealed by Cloudflare on create and rotate; the
 * provider stores it redacted in state and carries it forward across reads.
 * ### Creating a Service Token
 * **Example:** Basic token with a generated name
 * ```typescript
 * const token = yield* Cloudflare.Access.ServiceToken("Ci", {});
 * // token.clientId / token.clientSecret authenticate requests
 * ```
 *
 * **Example:** Token with an explicit name and validity
 * ```typescript
 * const token = yield* Cloudflare.Access.ServiceToken("Deploys", {
 *   name: "deploy-bot",
 *   duration: "17520h", // 2 years
 * });
 * ```
 *
 * ### Rotating the Secret
 * **Example:** Increment clientSecretVersion to rotate
 * ```typescript
 * const token = yield* Cloudflare.Access.ServiceToken("Ci", {
 *   clientSecretVersion: 2, // was 1 — bumping rotates the secret
 * });
 * ```
 *
 * ### Authorizing a Token
 * **Example:** Reference from an Access policy
 * ```typescript
 * const token = yield* Cloudflare.Access.ServiceToken("Ci", {});
 *
 * const policy = yield* Cloudflare.Access.Policy("AllowCi", {
 *   decision: "non_identity",
 *   include: [{ serviceToken: { tokenId: token.serviceTokenId } }],
 * });
 * ```
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export declare const ServiceToken: import("../../Resource.ts").ResourceClass<ServiceToken>;
export declare const isServiceToken: (value: unknown) => value is ServiceToken;
export declare const ServiceTokenProvider: () => import("effect/Layer").Layer<Provider.Provider<ServiceToken>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=ServiceToken.d.ts.map