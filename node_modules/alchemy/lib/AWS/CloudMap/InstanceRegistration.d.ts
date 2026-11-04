import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface InstanceRegistrationProps {
    /**
     * The ID of the Cloud Map service to register the instance with.
     * Changing the service replaces the registration.
     */
    serviceId: string;
    /**
     * The instance ID — unique within the service. Changing it replaces the
     * registration.
     */
    instanceId: string;
    /**
     * Instance attributes. For DNS services these drive record creation:
     * `AWS_INSTANCE_IPV4` (A records), `AWS_INSTANCE_IPV6` (AAAA),
     * `AWS_INSTANCE_PORT` (SRV), `AWS_INSTANCE_CNAME` (CNAME). Custom keys are
     * returned by `DiscoverInstances`. Mutable — re-registering with the same
     * instance ID updates the attributes.
     */
    attributes: Record<string, string>;
}
export interface InstanceRegistration extends Resource<"AWS.CloudMap.InstanceRegistration", InstanceRegistrationProps, {
    /**
     * The Cloud Map service the instance is registered with.
     */
    serviceId: string;
    /**
     * The identifier of the registered instance.
     */
    instanceId: string;
}, {}, Providers> {
}
/**
 * A manual AWS Cloud Map instance registration — registers a static
 * endpoint (an IP, port, CNAME, or an arbitrary attribute bag) with a Cloud
 * Map service so it is returned by `DiscoverInstances` and, for DNS
 * services, resolvable via Route 53.
 *
 * Use this for non-ECS targets: static IPs, on-prem hosts, external
 * dependencies. ECS registers its own tasks automatically via
 * `serviceRegistries`.
 *
 * `RegisterInstance` is an upsert — reconcile re-registers with the desired
 * attributes and Cloud Map converges the records. Registration and
 * deregistration are asynchronous; the provider polls the operations API
 * (bounded) until they complete.
 * ### Registering Instances
 * **Example:** Register a Static IP
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const instance = yield* AWS.CloudMap.InstanceRegistration("Primary", {
 *   serviceId: service.serviceId,
 *   instanceId: "primary",
 *   attributes: { AWS_INSTANCE_IPV4: "10.0.1.10" },
 * });
 * ```
 *
 * **Example:** Register an API-only Instance with Custom Attributes
 * ```typescript
 * const instance = yield* AWS.CloudMap.InstanceRegistration("Worker", {
 *   serviceId: service.serviceId,
 *   instanceId: "worker-1",
 *   attributes: { endpoint: "https://worker-1.internal:8443", zone: "us-west-2a" },
 * });
 * ```
 *
 * @resource
 */
export declare const InstanceRegistration: import("../../Resource.ts").ResourceClass<InstanceRegistration>;
export declare const InstanceRegistrationProvider: () => import("effect/Layer").Layer<Provider.Provider<InstanceRegistration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=InstanceRegistration.d.ts.map