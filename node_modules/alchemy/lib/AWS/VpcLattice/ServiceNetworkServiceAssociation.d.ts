import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ServiceNetworkServiceAssociationProps {
    /**
     * ID or ARN of the service network. Immutable — changing it replaces the
     * association.
     */
    serviceNetworkIdentifier: string;
    /**
     * ID or ARN of the lattice service to associate. Immutable — changing it
     * replaces the association.
     */
    serviceIdentifier: string;
    /**
     * User-defined tags to apply to the association.
     */
    tags?: Record<string, string>;
}
export interface ServiceNetworkServiceAssociation extends Resource<"AWS.VpcLattice.ServiceNetworkServiceAssociation", ServiceNetworkServiceAssociationProps, {
    /**
     * Service-assigned unique ID of the association.
     */
    associationId: string;
    /**
     * ARN of the association.
     */
    associationArn: string;
    /**
     * Current lifecycle status (e.g. `ACTIVE`, `CREATE_IN_PROGRESS`).
     */
    status: string;
    /**
     * ID of the associated lattice service.
     */
    serviceId?: string;
    /**
     * ID of the service network.
     */
    serviceNetworkId?: string;
    /**
     * DNS name clients in associated VPCs resolve the service by.
     */
    dnsName?: string;
    /**
     * Current tags reported for the association.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * Associates a VPC Lattice service with a service network, making the
 * service reachable from every VPC associated with that network.
 *
 * ### Associating a Service
 * **Example:** Basic Association
 * ```typescript
 * const assoc = yield* ServiceNetworkServiceAssociation("PaymentsLink", {
 *   serviceNetworkIdentifier: network.serviceNetworkId,
 *   serviceIdentifier: service.serviceId,
 * });
 * ```
 *
 * @resource
 */
export declare const ServiceNetworkServiceAssociation: import("../../Resource.ts").ResourceClass<ServiceNetworkServiceAssociation>;
export declare const ServiceNetworkServiceAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<ServiceNetworkServiceAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ServiceNetworkServiceAssociation.d.ts.map