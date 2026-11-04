import * as finspace from "@distilled.cloud/aws/finspace";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type KxEnvironmentStatus = finspace.EnvironmentStatus;
export type TransitGatewayConfiguration = finspace.TransitGatewayConfiguration;
export type CustomDNSServer = finspace.CustomDNSServer;
export interface KxEnvironmentProps {
    /**
     * Name of the kdb environment.
     * @default ${app}-${id}-${stage}-${suffix}
     */
    name?: string;
    /**
     * A description of the kdb environment.
     */
    description?: string;
    /**
     * The KMS key id used to encrypt data in the environment. Required;
     * changing it replaces the environment.
     */
    kmsKeyId: string;
    /**
     * Transit gateway to attach so on-prem kdb clients can reach the
     * environment. Attached once via `UpdateKxEnvironmentNetwork` after the
     * environment is created; FinSpace does not support changing an attached
     * network, so changing an existing configuration replaces the environment.
     */
    transitGatewayConfiguration?: TransitGatewayConfiguration;
    /**
     * Custom DNS servers to resolve on-prem hostnames from inside the
     * environment. Attached together with `transitGatewayConfiguration`;
     * changing an existing configuration replaces the environment.
     */
    customDNSConfiguration?: CustomDNSServer[];
    /**
     * Tags to associate with the environment.
     */
    tags?: Record<string, string>;
}
export interface KxEnvironment extends Resource<"AWS.FinSpace.KxEnvironment", KxEnvironmentProps, {
    /**
     * Service-assigned unique identifier of the kdb environment.
     */
    environmentId: string;
    /**
     * ARN of the kdb environment.
     */
    environmentArn: string;
    /**
     * The environment's name.
     */
    name: string;
    /**
     * Current lifecycle status of the environment.
     */
    status: KxEnvironmentStatus | undefined;
    /**
     * ID of the KMS key encrypting the environment.
     */
    kmsKeyId: string | undefined;
    /**
     * The environment's description.
     */
    description: string | undefined;
    /**
     * The transit gateway attached to the environment, if any.
     */
    transitGatewayConfiguration: TransitGatewayConfiguration | undefined;
    /**
     * The custom DNS servers configured on the environment, if any.
     */
    customDNSConfiguration: CustomDNSServer[] | undefined;
    /**
     * Current tags reported for the environment.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon FinSpace Managed kdb environment — the account-level container
 * that kdb databases, clusters, users, volumes and scaling groups live in.
 *
 * :::caution
 * kdb environment provisioning is slow (tens of minutes) and the service is
 * gated to onboarded accounts. Live lifecycle tests are gated behind
 * `AWS_TEST_FINSPACE=1`.
 * :::
 * ### Creating kdb Environments
 * **Example:** Basic kdb Environment
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const key = yield* AWS.KMS.Key("KdbKey", {});
 * const env = yield* AWS.FinSpace.KxEnvironment("Kdb", {
 *   kmsKeyId: key.keyArn,
 *   description: "managed kdb environment",
 * });
 * ```
 *
 * ### Connecting to On-Prem Networks
 * **Example:** Attach a Transit Gateway
 * ```typescript
 * const env = yield* AWS.FinSpace.KxEnvironment("Kdb", {
 *   kmsKeyId: key.keyArn,
 *   transitGatewayConfiguration: {
 *     transitGatewayID: "tgw-0123456789abcdef0",
 *     routableCIDRSpace: "10.0.0.0/16",
 *   },
 *   customDNSConfiguration: [
 *     { customDNSServerName: "dns.corp.example", customDNSServerIP: "10.0.0.2" },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const KxEnvironment: import("../../Resource.ts").ResourceClass<KxEnvironment>;
declare const KxEnvironmentProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "KxEnvironmentProvisioningFailed";
} & Readonly<A>;
/**
 * A kdb environment whose asynchronous provisioning converged to the
 * terminal `FAILED_CREATION` status.
 */
export declare class KxEnvironmentProvisioningFailed extends KxEnvironmentProvisioningFailed_base<{
    readonly environmentId: string;
    readonly status: string | undefined;
}> {
}
export declare const KxEnvironmentProvider: () => import("effect/Layer").Layer<Provider.Provider<KxEnvironment>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=KxEnvironment.d.ts.map