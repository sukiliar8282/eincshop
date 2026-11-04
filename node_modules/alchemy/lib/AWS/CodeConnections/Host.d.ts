import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * VPC configuration provisioned for a {@link Host} whose self-managed
 * provider is only reachable from inside a VPC.
 */
export interface HostVpcConfiguration {
    /**
     * ID of the VPC connected to the provider's infrastructure.
     */
    vpcId: string;
    /**
     * IDs of the subnets associated with the VPC.
     */
    subnetIds: string[];
    /**
     * IDs of the security groups associated with the VPC.
     */
    securityGroupIds: string[];
    /**
     * PEM value of the TLS certificate used by the provider's infrastructure,
     * for endpoints served with a self-signed or private CA certificate.
     * This is public certificate material (not a private key).
     */
    tlsCertificate?: string;
}
export interface HostProps {
    /**
     * Name of the host (1-64 chars). If omitted a deterministic physical name
     * is generated. Changing the name replaces the host.
     */
    name?: string;
    /**
     * The self-managed source provider the host is installed on. Changing the
     * provider replaces the host.
     */
    providerType: "GitHubEnterpriseServer" | "GitLabSelfManaged";
    /**
     * Endpoint of the infrastructure the provider is installed on, e.g.
     * `https://ghe.example.com`.
     */
    providerEndpoint: string;
    /**
     * VPC configuration to provision for the host when the provider endpoint
     * is only reachable from inside a VPC.
     */
    vpcConfiguration?: HostVpcConfiguration;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface Host extends Resource<"AWS.CodeConnections.Host", HostProps, {
    /** Physical name of the host. */
    hostName: string;
    /** ARN of the host (passed as `hostArn` to a `Connection`). */
    hostArn: string;
    /**
     * Host state. A freshly created host is `PENDING` until its setup is
     * completed **manually** in the AWS console; it then becomes
     * `AVAILABLE`.
     */
    hostStatus: string;
    /** The self-managed source provider. */
    providerType: string;
    /** Endpoint of the provider's infrastructure. */
    providerEndpoint: string;
}, never, Providers> {
}
/**
 * An AWS CodeConnections host — the infrastructure representation of a
 * self-managed source provider (GitHub Enterprise Server or GitLab
 * self-managed). One host serves all connections to that provider.
 *
 * A host is created in the `PENDING` state. Completing it requires a
 * one-time setup performed **manually** in the AWS console — there is no
 * API to finish the setup. Once completed the host becomes `AVAILABLE` and
 * `Connection`s can reference it via `hostArn`.
 * ### Creating a Host
 * **Example:** GitHub Enterprise Server Host (created PENDING)
 * ```typescript
 * const host = yield* CodeConnections.Host("GHE", {
 *   providerType: "GitHubEnterpriseServer",
 *   providerEndpoint: "https://ghe.example.com",
 * });
 * // host.hostStatus === "PENDING"
 * // Complete the setup in the console before creating connections on it.
 * ```
 *
 * **Example:** Connection on a Host
 * ```typescript
 * const connection = yield* CodeConnections.Connection("GHEConn", {
 *   providerType: "GitHubEnterpriseServer",
 *   hostArn: host.hostArn,
 * });
 * ```
 *
 * ### Reaching a Private Endpoint
 * **Example:** Host with VPC Configuration
 * ```typescript
 * const host = yield* CodeConnections.Host("PrivateGHE", {
 *   providerType: "GitHubEnterpriseServer",
 *   providerEndpoint: "https://ghe.internal.example.com",
 *   vpcConfiguration: {
 *     vpcId: vpc.vpcId,
 *     subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *     securityGroupIds: [securityGroup.securityGroupId],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Host: import("../../Resource.ts").ResourceClass<Host>;
export declare const HostProvider: () => import("effect/Layer").Layer<Provider.Provider<Host>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Host.d.ts.map