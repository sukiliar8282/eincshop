import * as workers from "@distilled.cloud/cloudflare/workers";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Workers.Subdomain";
type TypeId = typeof TypeId;
export type SubdomainProps = {
    /**
     * The account's `workers.dev` subdomain name (the `<subdomain>` in
     * `https://<script>.<subdomain>.workers.dev`). Must contain only
     * lowercase ASCII letters, digits, and hyphens.
     *
     * Mutable — renamed in place via PUT. **Renaming changes the URL of
     * every deployed Worker on the account that uses a `workers.dev`
     * subdomain**, so treat changes with extreme care.
     */
    subdomain: string;
};
export type SubdomainAttributes = {
    /** The Cloudflare account the subdomain belongs to. */
    accountId: string;
    /** The account's current `workers.dev` subdomain name. */
    subdomain: string;
    /**
     * The subdomain name the account had before Alchemy first managed this
     * singleton, or `undefined` if the account had no subdomain registered.
     * Restored on destroy (or the subdomain is removed entirely when there
     * was none).
     */
    initialSubdomain: string | undefined;
};
export type Subdomain = Resource<TypeId, SubdomainProps, SubdomainAttributes, never, Providers>;
/**
 * The account-wide `workers.dev` subdomain singleton
 * (`/accounts/{account_id}/workers/subdomain`). Every Worker with
 * `workers.dev` enabled is served at
 * `https://<script>.<subdomain>.workers.dev`.
 *
 * Each account has at most one subdomain — "creating" this resource claims
 * (or renames to) the requested name. Subdomain names are globally unique
 * across all Cloudflare accounts; claiming a taken name fails with the
 * typed `SubdomainAlreadyExists` error.
 *
 * Destroy is capture-and-restore: the subdomain is renamed back to the
 * value it had before Alchemy first managed it. If the account had no
 * subdomain at first touch, destroy removes it entirely.
 *
 * **Warning:** renaming or removing the subdomain immediately changes the
 * URL of every deployed Worker on the account that relies on
 * `workers.dev`. Only manage this resource on accounts where that is
 * acceptable.
 * ### Managing the subdomain
 * **Example:** Pin the account's workers.dev subdomain
 * ```typescript
 * const sub = yield* Cloudflare.Workers.Subdomain("Subdomain", {
 *   subdomain: "my-team",
 * });
 * // Workers are now served from https://<script>.my-team.workers.dev
 * ```
 *
 * @see https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
 *
 * @resource
 * @product Workers
 * @category Workers & Compute
 */
export declare const Subdomain: import("../../Resource.ts").ResourceClass<Subdomain>;
/**
 * Returns true if the given value is a Subdomain resource.
 */
export declare const isSubdomain: (value: unknown) => value is Subdomain;
export declare const SubdomainProvider: () => import("effect/Layer").Layer<Provider.Provider<Subdomain>, never, CloudflareEnvironment | workers.CloudflareOpContext>;
export {};
//# sourceMappingURL=Subdomain.d.ts.map