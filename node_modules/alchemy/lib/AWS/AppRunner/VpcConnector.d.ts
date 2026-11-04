import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface VpcConnectorProps {
    /**
     * Name of the VPC connector. Must be 4-40 characters. If omitted, a
     * deterministic physical name is generated. Changing the name replaces
     * the connector.
     */
    vpcConnectorName?: string;
    /**
     * IDs of the VPC subnets App Runner uses for outgoing (egress) traffic.
     * All subnets must belong to the same VPC. VPC connectors are
     * immutable — changing subnets replaces the connector.
     */
    subnets: string[];
    /**
     * IDs of the security groups applied to the connector's network
     * interfaces. Changing security groups replaces the connector.
     * @default the VPC's default security group
     */
    securityGroups?: string[];
    /**
     * User-defined tags for the connector.
     */
    tags?: Record<string, string>;
}
export interface VpcConnector extends Resource<"AWS.AppRunner.VpcConnector", VpcConnectorProps, {
    /**
     * Name of the VPC connector.
     */
    vpcConnectorName: string;
    /**
     * ARN of this VPC connector revision.
     */
    vpcConnectorArn: string;
    /**
     * Revision number of the connector (revisions are immutable).
     */
    vpcConnectorRevision: number;
    /**
     * Subnets the connector attaches to.
     */
    subnets: string[];
    /**
     * Security groups applied to outbound traffic.
     */
    securityGroups: string[];
    /**
     * Current status of the connector (e.g. `ACTIVE`).
     */
    status: string;
}, never, Providers> {
}
/**
 * An AWS App Runner VPC connector. Associating a connector with an App
 * Runner service routes the service's outbound traffic through your VPC
 * (e.g. to reach an RDS database in private subnets).
 *
 * VPC connectors are immutable: any change to subnets or security groups
 * replaces the connector.
 * ### Creating a VPC Connector
 * **Example:** Connector over Two Subnets
 * ```typescript
 * const connector = yield* AppRunner.VpcConnector("Egress", {
 *   subnets: [subnetA.subnetId, subnetB.subnetId],
 *   securityGroups: [egressSecurityGroup.securityGroupId],
 * });
 * ```
 *
 * ### Routing a Service through the VPC
 * **Example:** Service with VPC Egress
 * ```typescript
 * const service = yield* AppRunner.Service("Api", {
 *   imageRepository: {
 *     imageIdentifier: image.imageUri,
 *     imageRepositoryType: "ECR",
 *     port: "8080",
 *   },
 *   accessRoleArn: accessRole.roleArn,
 *   networkConfiguration: {
 *     egressType: "VPC",
 *     vpcConnectorArn: connector.vpcConnectorArn,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const VpcConnector: import("../../Resource.ts").ResourceClass<VpcConnector>;
export declare const VpcConnectorProvider: () => import("effect/Layer").Layer<Provider.Provider<VpcConnector>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=VpcConnector.d.ts.map