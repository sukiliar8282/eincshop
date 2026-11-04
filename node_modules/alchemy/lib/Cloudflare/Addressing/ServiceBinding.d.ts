import * as addressing from "@distilled.cloud/cloudflare/addressing";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Addressing.ServiceBinding";
type TypeId = typeof TypeId;
export interface ServiceBindingProps {
    /**
     * Identifier of the parent BYOIP prefix. Changing it forces a
     * replacement.
     */
    prefixId: string;
    /**
     * IP Prefix in Classless Inter-Domain Routing format to bind. Must be
     * contained in the parent prefix. Changing it forces a replacement.
     */
    cidr: string;
    /**
     * Identifier of the Cloudflare service (CDN, Spectrum, Magic Transit) to
     * bind the CIDR to. Service IDs are discoverable via the
     * `addressing.listServices` catalog. Changing it forces a replacement.
     */
    serviceId: string;
}
export interface ServiceBindingAttributes {
    /** Cloudflare-assigned identifier of the service binding. */
    bindingId: string;
    /** Identifier of the parent BYOIP prefix. */
    prefixId: string;
    /** The Cloudflare account the prefix belongs to. */
    accountId: string;
    /** Bound IP Prefix in CIDR format. */
    cidr: string;
    /** Identifier of the bound Cloudflare service. */
    serviceId: string;
    /** Name of the bound Cloudflare service. */
    serviceName: string | undefined;
    /**
     * Deployment status of the binding on the Cloudflare network.
     * Provisioning is asynchronous — `state` flips from `provisioning` to
     * `active` after a few minutes.
     */
    provisioning: {
        state: string | undefined;
    };
}
export type ServiceBinding = Resource<TypeId, ServiceBindingProps, ServiceBindingAttributes, never, Providers>;
/**
 * Binds part of a BYOIP prefix to a Cloudflare service (CDN, Spectrum, or
 * Magic Transit), routing traffic for the bound CIDR to that service.
 *
 * Bindings are create/delete only — every prop change forces a
 * replacement. Provisioning to the edge is asynchronous: the binding is
 * returned immediately with `provisioning.state: "provisioning"` and flips
 * to `"active"` on Cloudflare's side; the resource does not wait for it.
 * ### Binding a Prefix to a Service
 * **Example:** Bind a /24 to the CDN
 * ```typescript
 * const binding = yield* Cloudflare.Addressing.ServiceBinding("cdn", {
 *   prefixId: prefix.prefixId,
 *   cidr: "192.0.2.0/24",
 *   serviceId: cdnServiceId,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/byoip/concepts/service-bindings/
 *
 * @resource
 * @product Addressing
 * @category Network
 */
export declare const ServiceBinding: import("../../Resource.ts").ResourceClass<ServiceBinding>;
/**
 * Returns true if the given value is an ServiceBinding resource.
 */
export declare const isServiceBinding: (value: unknown) => value is ServiceBinding;
export declare const ServiceBindingProvider: () => import("effect/Layer").Layer<Provider.Provider<ServiceBinding>, never, CloudflareEnvironment | addressing.CloudflareOpContext>;
export {};
//# sourceMappingURL=ServiceBinding.d.ts.map