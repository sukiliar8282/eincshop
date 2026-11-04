import * as pages from "@distilled.cloud/cloudflare/pages";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Pages.Domain";
type TypeId = typeof TypeId;
/**
 * Lifecycle status of a Pages custom domain. Newly attached domains start
 * `initializing`/`pending` and become `active` once DNS validation and
 * certificate issuance complete.
 */
export type DomainStatus = "initializing" | "pending" | "active" | "deactivated" | "blocked" | "error" | (string & {});
export interface DomainProps {
    /**
     * Name of the Pages project the domain is attached to (e.g.
     * `project.name`). The attachment cannot be moved — changing the project
     * triggers a replacement.
     */
    projectName: string;
    /**
     * The custom domain name (e.g. `www.example.com`). The domain is the
     * attachment's identity — changing it triggers a replacement.
     *
     * Declared as plain `string` so it is statically knowable inside `diff`.
     */
    name: string;
}
export interface DomainAttributes {
    /**
     * Cloudflare-assigned UUID of the domain attachment.
     */
    domainId: string;
    /**
     * The Cloudflare account the project belongs to.
     */
    accountId: string;
    /**
     * Name of the Pages project the domain is attached to.
     */
    projectName: string;
    /**
     * The custom domain name.
     */
    name: string;
    /**
     * Current lifecycle status of the domain. Newly attached domains stay
     * `pending` until DNS validation completes (the zone needs a CNAME from
     * the domain to the project's `*.pages.dev` subdomain).
     */
    status: DomainStatus;
    /**
     * Certificate authority issuing the domain's TLS certificate.
     */
    certificateAuthority: string;
    /**
     * Status of the domain-ownership validation.
     */
    validationStatus: string;
    /**
     * Method used for domain-ownership validation (`http` or `txt`).
     */
    validationMethod: string;
    /**
     * Status of the domain verification.
     */
    verificationStatus: string;
    /**
     * Zone tag (zone id) of the Cloudflare zone the domain belongs to, when
     * the zone is on the same account.
     */
    zoneTag: string;
    /**
     * When the domain was attached to the project.
     */
    createdOn: string;
}
export type Domain = Resource<TypeId, DomainProps, DomainAttributes, never, Providers>;
/**
 * A custom domain attached to a Cloudflare Pages project.
 *
 * Attaching a domain starts Cloudflare's validation flow: the domain must
 * resolve to the project (typically via a CNAME record pointing at the
 * project's `*.pages.dev` subdomain) before its status becomes `active`.
 * The resource does not wait for activation — compose it with
 * `Cloudflare.DNS.Record` to create the CNAME, and certificate issuance
 * completes asynchronously.
 *
 * Both properties are the attachment's identity, so every change triggers a
 * replacement (detach + attach).
 * ### Attaching a Domain
 * **Example:** Custom domain with its CNAME record
 * ```typescript
 * const project = yield* Cloudflare.Pages.Project("site", {});
 *
 * const domain = yield* Cloudflare.Pages.Domain("site-domain", {
 *   projectName: project.name,
 *   name: "www.example.com",
 * });
 *
 * yield* Cloudflare.DNS.Record("site-cname", {
 *   zoneId: zone.zoneId,
 *   name: "www.example.com",
 *   type: "CNAME",
 *   content: project.subdomain,
 *   proxied: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/pages/configuration/custom-domains/
 *
 * @resource
 * @product Pages
 * @category Workers & Compute
 */
export declare const Domain: import("../../Resource.ts").ResourceClass<Domain>;
/**
 * Returns true if the given value is a Domain resource.
 */
export declare const isDomain: (value: unknown) => value is Domain;
export declare const DomainProvider: () => import("effect/Layer").Layer<Provider.Provider<Domain>, never, CloudflareEnvironment | pages.CloudflareOpContext>;
export {};
//# sourceMappingURL=Domain.d.ts.map