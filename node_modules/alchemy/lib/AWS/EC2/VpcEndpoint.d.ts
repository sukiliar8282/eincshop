import type * as EC2 from "@distilled.cloud/aws/ec2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
import type { RouteTableId } from "./RouteTable.ts";
import type { SecurityGroupId } from "./SecurityGroup.ts";
import type { SubnetId } from "./Subnet.ts";
import type { VpcId } from "./Vpc.ts";
export type VpcEndpointId<ID extends string = string> = `vpce-${ID}`;
export declare const VpcEndpointId: <ID extends string>(id: ID) => ID & VpcEndpointId<ID>;
export type VpcEndpointArn = `arn:aws:ec2:${RegionID}:${AccountID}:vpc-endpoint/${VpcEndpointId}`;
export interface VpcEndpointProps {
    /**
     * The VPC to create the endpoint in.
     */
    vpcId: VpcId;
    /**
     * The service name.
     * For AWS services, use the format: com.amazonaws.<region>.<service>
     * @example "com.amazonaws.us-east-1.s3"
     */
    serviceName: string;
    /**
     * The type of endpoint.
     * - Gateway: For S3 and DynamoDB (route table based)
     * - Interface: For most other AWS services (ENI based)
     * - GatewayLoadBalancer: For Gateway Load Balancer endpoints
     * @default "Gateway"
     */
    vpcEndpointType?: EC2.VpcEndpointType;
    /**
     * The IDs of route tables for a Gateway endpoint.
     * Required for Gateway endpoints.
     */
    routeTableIds?: RouteTableId[];
    /**
     * The IDs of subnets for an Interface endpoint.
     * Required for Interface endpoints.
     */
    subnetIds?: SubnetId[];
    /**
     * The IDs of security groups for an Interface endpoint.
     * Required for Interface endpoints.
     */
    securityGroupIds?: SecurityGroupId[];
    /**
     * Whether to associate a private hosted zone with the VPC.
     * Only applicable for Interface endpoints.
     * @default true
     */
    privateDnsEnabled?: boolean;
    /**
     * A policy to attach to the endpoint that controls access to the service.
     * The policy document must be in JSON format.
     */
    policyDocument?: string;
    /**
     * The IP address type for the endpoint.
     */
    ipAddressType?: EC2.IpAddressType;
    /**
     * The DNS options for the endpoint.
     */
    dnsOptions?: {
        dnsRecordIpType?: EC2.DnsRecordIpType;
        privateDnsOnlyForInboundResolverEndpoint?: boolean;
    };
    /**
     * Tags to assign to the VPC endpoint.
     */
    tags?: Record<string, string>;
}
export interface VpcEndpoint extends Resource<"AWS.EC2.VpcEndpoint", VpcEndpointProps, {
    /**
     * The ID of the VPC endpoint.
     */
    vpcEndpointId: VpcEndpointId;
    /**
     * The Amazon Resource Name (ARN) of the VPC endpoint.
     */
    vpcEndpointArn: VpcEndpointArn;
    /**
     * The type of endpoint.
     */
    vpcEndpointType: EC2.VpcEndpointType;
    /**
     * The ID of the VPC.
     */
    vpcId: VpcId;
    /**
     * The service name.
     */
    serviceName: string;
    /**
     * The current state of the VPC endpoint.
     */
    state: EC2.State;
    /**
     * The policy document associated with the endpoint.
     */
    policyDocument?: string;
    /**
     * The IDs of the route tables associated with the endpoint.
     */
    routeTableIds?: string[];
    /**
     * The IDs of the subnets associated with the endpoint.
     */
    subnetIds?: string[];
    /**
     * Information about the security groups associated with the network interfaces.
     */
    groups?: Array<{
        groupId: string;
        groupName: string;
    }>;
    /**
     * Whether private DNS is enabled.
     */
    privateDnsEnabled?: boolean;
    /**
     * Whether the VPC endpoint is being managed by its service.
     */
    requesterManaged?: boolean;
    /**
     * The IDs of the network interfaces for the endpoint.
     */
    networkInterfaceIds?: string[];
    /**
     * The DNS entries for the endpoint.
     */
    dnsEntries?: Array<{
        dnsName?: string;
        hostedZoneId?: string;
    }>;
    /**
     * The date and time the VPC endpoint was created.
     */
    creationTimestamp?: string;
    /**
     * The ID of the AWS account that owns the VPC endpoint.
     */
    ownerId?: string;
    /**
     * The IP address type for the endpoint.
     */
    ipAddressType?: EC2.IpAddressType;
    /**
     * The DNS options for the endpoint.
     */
    dnsOptions?: {
        dnsRecordIpType?: EC2.DnsRecordIpType;
        privateDnsOnlyForInboundResolverEndpoint?: boolean;
    };
    /**
     * The last error that occurred for VPC endpoint.
     */
    lastError?: {
        code?: string;
        message?: string;
    };
}, never, Providers> {
}
/**
 * A VPC endpoint that connects your VPC privately to an AWS service (or a
 * service behind a Gateway Load Balancer) without traversing the public
 * internet, a NAT gateway, or an internet gateway.
 *
 * The `vpcEndpointType` selects how the connection is realized:
 * - `"Gateway"` — for S3 and DynamoDB; traffic is directed by adding routes to
 *   the route tables in `routeTableIds` (no hourly cost).
 * - `"Interface"` — for most other AWS services; provisions elastic network
 *   interfaces in `subnetIds`, guarded by `securityGroupIds`, and optionally
 *   resolves the service's public DNS name privately via `privateDnsEnabled`.
 * - `"GatewayLoadBalancer"` — routes traffic through a third-party appliance
 *   fleet fronted by a Gateway Load Balancer.
 *
 * Changing `vpcId`, `serviceName`, or `vpcEndpointType` replaces the endpoint;
 * route tables, subnets, security groups, DNS, and the policy update in place.
 *
 * ### Gateway Endpoints
 * Gateway endpoints target S3 and DynamoDB and work by injecting a prefix-list
 * route into each route table you list, so requests to the service stay on the
 * AWS network.
 * **Example:** S3 Gateway Endpoint
 * ```typescript
 * const s3Endpoint = yield* AWS.EC2.VpcEndpoint("S3Endpoint", {
 *   vpcId: vpc.vpcId,
 *   serviceName: "com.amazonaws.us-east-1.s3",
 *   vpcEndpointType: "Gateway",
 *   routeTableIds: [privateRouteTable.routeTableId],
 *   tags: { Name: "s3-endpoint" },
 * });
 * ```
 * Listing the private subnets' route tables in `routeTableIds` lets those
 * subnets reach S3 directly, removing NAT data-processing charges for S3 traffic
 * and keeping it off the public internet.
 *
 * ### Interface Endpoints
 * Interface endpoints place an ENI in each chosen subnet and are reached over
 * private IPs; enabling private DNS lets existing SDK calls resolve to the
 * endpoint transparently.
 * **Example:** Secrets Manager Interface Endpoint
 * ```typescript
 * const secretsEndpoint = yield* AWS.EC2.VpcEndpoint("SecretsEndpoint", {
 *   vpcId: vpc.vpcId,
 *   serviceName: "com.amazonaws.us-east-1.secretsmanager",
 *   vpcEndpointType: "Interface",
 *   subnetIds: [privateSubnet.subnetId],
 *   securityGroupIds: [endpointSecurityGroup.groupId],
 *   privateDnsEnabled: true,
 *   ipAddressType: "ipv4",
 *   dnsOptions: {
 *     dnsRecordIpType: "ipv4",
 *   },
 * });
 * ```
 * The endpoint gets an interface in each `subnetIds` entry, `securityGroupIds`
 * controls who may reach those interfaces, and `privateDnsEnabled: true` makes
 * the service's default DNS name resolve to the endpoint; `ipAddressType` and
 * `dnsOptions` tune the IP family used for the interfaces and their DNS records.
 *
 * ### Restricting Access with a Policy
 * **Example:** Endpoint Policy Limiting Access to One Bucket
 * ```typescript
 * const s3Endpoint = yield* AWS.EC2.VpcEndpoint("RestrictedS3Endpoint", {
 *   vpcId: vpc.vpcId,
 *   serviceName: "com.amazonaws.us-east-1.s3",
 *   vpcEndpointType: "Gateway",
 *   routeTableIds: [privateRouteTable.routeTableId],
 *   policyDocument: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: "*",
 *         Action: ["s3:GetObject"],
 *         Resource: ["arn:aws:s3:::my-bucket/*"],
 *       },
 *     ],
 *   }),
 * });
 * ```
 * `policyDocument` attaches an endpoint policy (JSON) that constrains which
 * service actions and resources can be reached through the endpoint; omit it to
 * allow full access to the service.
 *
 * @resource
 */
export declare const VpcEndpoint: import("../../Resource.ts").ResourceClass<VpcEndpoint>;
export declare const VpcEndpointProvider: () => import("effect/Layer").Layer<Provider.Provider<VpcEndpoint>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=VpcEndpoint.d.ts.map