import * as transfer from "@distilled.cloud/aws/transfer";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ServerProps {
    /**
     * File-transfer protocols the server exposes.
     * @default ["SFTP"]
     */
    protocols?: transfer.Protocol[];
    /**
     * Storage domain the server serves files from. Changing it replaces the
     * server.
     * @default "S3"
     */
    domain?: transfer.Domain;
    /**
     * Where the server endpoint is hosted. `PUBLIC` is internet-facing;
     * `VPC` places it inside a VPC (requires `endpointDetails`).
     * @default "PUBLIC"
     */
    endpointType?: transfer.EndpointType;
    /**
     * VPC endpoint configuration (subnets, security groups, address
     * allocations). Required when `endpointType` is `VPC`.
     */
    endpointDetails?: transfer.EndpointDetails;
    /**
     * How users authenticate. `SERVICE_MANAGED` stores SSH keys in Transfer
     * Family; `API_GATEWAY`/`AWS_LAMBDA`/`AWS_DIRECTORY_SERVICE` delegate to a
     * custom identity provider. Changing it replaces the server.
     * @default "SERVICE_MANAGED"
     */
    identityProviderType?: transfer.IdentityProviderType;
    /**
     * Configuration for a custom identity provider (required unless
     * `identityProviderType` is `SERVICE_MANAGED`).
     */
    identityProviderDetails?: transfer.IdentityProviderDetails;
    /**
     * IAM role ARN Transfer Family assumes to publish CloudWatch logs.
     */
    loggingRole?: string;
    /**
     * Name of the security policy (cipher/algorithm set) attached to the server.
     */
    securityPolicyName?: string;
    /**
     * Banner shown to clients before authentication (SFTP/FTPS only).
     */
    preAuthenticationLoginBanner?: string;
    /**
     * Banner shown to clients after authentication.
     */
    postAuthenticationLoginBanner?: string;
    /**
     * Protocol-specific settings (passive IP, TLS session resumption, etc.).
     */
    protocolDetails?: transfer.ProtocolDetails;
    /**
     * S3 storage options such as directory-listing optimization.
     */
    s3StorageOptions?: transfer.S3StorageOptions;
    /**
     * Workflows triggered on file upload.
     */
    workflowDetails?: transfer.WorkflowDetails;
    /**
     * CloudWatch Logs log-group ARNs the server streams structured logs to.
     */
    structuredLogDestinations?: string[];
    /**
     * IP address type of the endpoint.
     * @default "IPV4"
     */
    ipAddressType?: transfer.IpAddressType;
    /**
     * User-defined tags for the server.
     */
    tags?: Record<string, string>;
}
export interface Server extends Resource<"AWS.Transfer.Server", ServerProps, {
    /**
     * AWS-assigned server ID (e.g. `s-0123456789abcdef0`). Clients connect to
     * `{serverId}.server.transfer.{region}.amazonaws.com`.
     */
    serverId: string;
    /**
     * ARN of the server.
     */
    arn: string;
    /**
     * Where the server endpoint is hosted (`PUBLIC` or `VPC`).
     */
    endpointType: string;
    /**
     * Storage domain the server serves files from (`S3` or `EFS`).
     */
    domain: string;
    /**
     * How users authenticate.
     */
    identityProviderType: string;
    /**
     * File-transfer protocols the server exposes.
     */
    protocols: string[];
    /**
     * Current lifecycle state (e.g. `ONLINE`, `STARTING`).
     */
    state: string | undefined;
    /**
     * Current tags reported for the server.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Transfer Family server — a managed SFTP/FTPS/FTP/AS2 endpoint in
 * front of S3 or EFS storage. A running server is billed hourly (plus data
 * transfer), so create it only when needed and destroy it promptly.
 * ### Creating a Server
 * **Example:** Public SFTP Server (Service-Managed Users)
 * ```typescript
 * const server = yield* Server("Sftp", {
 *   protocols: ["SFTP"],
 *   domain: "S3",
 *   endpointType: "PUBLIC",
 *   identityProviderType: "SERVICE_MANAGED",
 * });
 * ```
 *
 * ### Adding Users
 * **Example:** SFTP Server with a Service-Managed User
 * ```typescript
 * const server = yield* Server("Sftp", {
 *   protocols: ["SFTP"],
 *   identityProviderType: "SERVICE_MANAGED",
 * });
 *
 * // Role Transfer Family assumes to access the S3 storage backend
 * const role = yield* AWS.IAM.Role("TransferUserRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "transfer.amazonaws.com" },
 *         Action: ["sts:AssumeRole"],
 *       },
 *     ],
 *   },
 *   inlinePolicies: {
 *     s3: {
 *       Version: "2012-10-17",
 *       Statement: [
 *         {
 *           Effect: "Allow",
 *           Action: ["s3:ListBucket", "s3:GetObject", "s3:PutObject"],
 *           Resource: [bucket.bucketArn, Output.interpolate`${bucket.bucketArn}/*`],
 *         },
 *       ],
 *     },
 *   },
 * });
 *
 * const user = yield* User("Alice", {
 *   serverId: server.serverId,
 *   userName: "alice",
 *   role: role.roleArn,
 *   homeDirectory: Output.interpolate`/${bucket.bucketName}/alice`,
 *   sshPublicKeyBody: "ssh-ed25519 AAAA...",
 * });
 * ```
 *
 * @resource
 */
export declare const Server: import("../../Resource.ts").ResourceClass<Server>;
export declare const ServerProvider: () => import("effect/Layer").Layer<Provider.Provider<Server>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Server.d.ts.map