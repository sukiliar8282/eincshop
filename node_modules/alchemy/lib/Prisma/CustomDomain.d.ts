import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { App } from "./App.ts";
import type { Compute } from "./Compute.ts";
import type { Providers } from "./Providers.ts";
import type { CustomDomain as ApiCustomDomain } from "./Types.ts";
type AppReference = string | App | Compute;
export interface CustomDomainProps {
    /**
     * App ID or Compute output that owns the domain. The App must be attached to
     * the project's current default branch.
     */
    app: AppReference;
    /**
     * Hostname to attach to the app.
     */
    hostname: string;
}
export interface CustomDomain extends Resource<"Prisma.CustomDomain", CustomDomainProps, {
    /**
     * Prisma custom domain ID.
     */
    customDomainId: string;
    /**
     * Hostname attached to the app.
     */
    hostname: string;
    /**
     * Current app ID that owns the domain.
     */
    appId: string;
    /**
     * Prisma normalized custom domain provisioning status.
     */
    status: ApiCustomDomain["status"];
    /**
     * Raw custom-domain status returned by Foundry.
     */
    foundryStatus: string;
    /**
     * Failure reason returned by Prisma, when provisioning failed.
     */
    failureReason: string | null;
    /**
     * Failure category returned by Prisma, when provisioning failed.
     */
    failureCategory: ApiCustomDomain["failureCategory"];
    /**
     * Certificate expiration timestamp, when available.
     */
    certExpiresAt: string | null;
    /**
     * DNS records the hostname should point at.
     */
    dnsRecords: ApiCustomDomain["dnsRecords"];
    /**
     * ISO timestamp when the custom domain was created.
     */
    createdAt: string;
    /**
     * ISO timestamp when the custom domain was last updated.
     */
    updatedAt: string;
}, never, Providers> {
}
/**
 * A Prisma app custom domain.
 *
 * Domains can only attach to Apps on the project's current default branch.
 * Creating this resource starts asynchronous DNS and certificate provisioning;
 * configure the returned `dnsRecords` and inspect `status`, `foundryStatus`,
 * and `failureReason` before routing production traffic.
 *
 * App and hostname changes are intentionally rejected because the Management
 * API cannot replace a live domain atomically. Create a second resource,
 * verify DNS and TLS, cut traffic over, and then remove the old resource.
 *
 * ### Creating a Custom Domain
 * **Example:** Attach a hostname to an app
 * ```typescript
 * const domain = yield* Prisma.CustomDomain("api-domain", {
 *   app: api.appId,
 *   hostname: "api.example.com",
 * });
 * ```
 *
 * @resource
 */
export declare const CustomDomain: import("../Resource.ts").ResourceClass<CustomDomain>;
export declare const CustomDomainProvider: () => import("effect/Layer").Layer<Provider.Provider<CustomDomain>, never, any>;
export {};
//# sourceMappingURL=CustomDomain.d.ts.map