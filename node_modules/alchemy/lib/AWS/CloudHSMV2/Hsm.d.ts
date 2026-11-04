import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface HsmProps {
    /**
     * ID of the {@link Cluster} the HSM is created in. Changing the cluster
     * replaces the HSM.
     */
    clusterId: string;
    /**
     * Availability Zone the HSM is placed into, e.g. `"us-west-2a"`. Must be
     * one of the AZs covered by the cluster's subnets. Changing the AZ
     * replaces the HSM.
     */
    availabilityZone: string;
    /**
     * IP address for the HSM's elastic network interface. Must be free in the
     * subnet of the chosen Availability Zone. Changing the address replaces
     * the HSM.
     * @default an address picked by AWS from the subnet
     */
    ipAddress?: string;
}
export interface Hsm extends Resource<"AWS.CloudHSMV2.Hsm", HsmProps, {
    /**
     * The unique identifier of the HSM.
     */
    hsmId: string;
    /**
     * The cluster the HSM belongs to.
     */
    clusterId: string;
    /**
     * The Availability Zone the HSM was placed in.
     */
    availabilityZone: string | undefined;
    /**
     * The subnet the HSM's ENI lives in.
     */
    subnetId: string | undefined;
    /**
     * The elastic network interface attached to the HSM.
     */
    eniId: string | undefined;
    /**
     * The IP address of the HSM's ENI.
     */
    eniIp: string | undefined;
    /**
     * Current state of the HSM (e.g. `ACTIVE`).
     */
    state: string;
}, never, Providers> {
}
/**
 * A hardware security module (HSM) inside an AWS CloudHSM {@link Cluster}.
 *
 * HSMs take roughly 10-20 minutes to provision and are billed hourly while
 * they exist. The cluster must be in the `UNINITIALIZED`, `ACTIVE`, or
 * `DEGRADED` state to accept a new HSM. Destroy HSMs you are not using.
 * ### Creating an HSM
 * **Example:** HSM in a Cluster's Availability Zone
 * ```typescript
 * const hsm = yield* Hsm("Primary", {
 *   clusterId: cluster.clusterId,
 *   availabilityZone: "us-west-2a",
 * });
 * ```
 *
 * **Example:** HSM with a Fixed ENI Address
 * ```typescript
 * const hsm = yield* Hsm("Primary", {
 *   clusterId: cluster.clusterId,
 *   availabilityZone: "us-west-2a",
 *   ipAddress: "10.0.1.20",
 * });
 * ```
 *
 * @resource
 */
export declare const Hsm: import("../../Resource.ts").ResourceClass<Hsm>;
export declare const HsmProvider: () => import("effect/Layer").Layer<Provider.Provider<Hsm>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Hsm.d.ts.map