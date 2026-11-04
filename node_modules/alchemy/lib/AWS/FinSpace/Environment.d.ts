import * as finspace from "@distilled.cloud/aws/finspace";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type EnvironmentStatus = finspace.EnvironmentStatus;
export type FederationMode = finspace.FederationMode;
export type FederationParameters = finspace.FederationParameters;
export type SuperuserParameters = finspace.SuperuserParameters;
export interface EnvironmentProps {
    /**
     * Name of the FinSpace environment.
     * @default ${app}-${id}-${stage}-${suffix}
     */
    name?: string;
    /**
     * A description of the environment.
     */
    description?: string;
    /**
     * The KMS key id used to encrypt data in the environment. Changing it
     * replaces the environment.
     */
    kmsKeyId?: string;
    /**
     * Authentication mode for the environment — `FEDERATED` (SAML) or `LOCAL`.
     */
    federationMode?: FederationMode;
    /**
     * SAML federation configuration, required when `federationMode` is
     * `FEDERATED`.
     */
    federationParameters?: FederationParameters;
    /**
     * Configuration of the superuser created with the environment. Only used
     * at creation; changing it replaces the environment.
     */
    superuserParameters?: SuperuserParameters;
    /**
     * ARNs of the sample data bundles to install. Only used at creation;
     * changing it replaces the environment.
     */
    dataBundles?: string[];
    /**
     * Tags to associate with the environment.
     */
    tags?: Record<string, string>;
}
export interface Environment extends Resource<"AWS.FinSpace.Environment", EnvironmentProps, {
    /**
     * Service-assigned unique identifier of the environment.
     */
    environmentId: string;
    /**
     * ARN of the environment.
     */
    environmentArn: string;
    /**
     * The environment's name.
     */
    name: string;
    /**
     * Current lifecycle status of the environment.
     */
    status: EnvironmentStatus | undefined;
    /**
     * Sign-in URL for the web application of the environment.
     */
    environmentUrl: string | undefined;
    /**
     * URL of the integrated SageMaker Studio domain.
     */
    sageMakerStudioDomainUrl: string | undefined;
    /**
     * ID of the KMS key encrypting the environment.
     */
    kmsKeyId: string | undefined;
    /**
     * AWS account ID of the dedicated service account associated with the
     * environment.
     */
    dedicatedServiceAccountId: string | undefined;
    /**
     * Current tags reported for the environment.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon FinSpace environment — a managed data management and analytics
 * workspace for the financial services industry.
 *
 * :::caution
 * FinSpace is closed to new customers and environment provisioning takes
 * ~20 minutes and bills while it exists. Live lifecycle tests are gated
 * behind `AWS_TEST_FINSPACE=1`.
 * :::
 * ### Creating Environments
 * **Example:** Basic Environment
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const env = yield* AWS.FinSpace.Environment("Analytics", {
 *   description: "research analytics environment",
 * });
 * ```
 *
 * **Example:** Federated Environment
 * ```typescript
 * const env = yield* AWS.FinSpace.Environment("Analytics", {
 *   federationMode: "FEDERATED",
 *   federationParameters: {
 *     samlMetadataURL: "https://idp.example.com/metadata.xml",
 *     federationProviderName: "idp.example.com",
 *     applicationCallBackURL: "https://example.com/callback",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Environment: import("../../Resource.ts").ResourceClass<Environment>;
declare const EnvironmentProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "EnvironmentProvisioningFailed";
} & Readonly<A>;
/**
 * An environment whose asynchronous provisioning converged to the terminal
 * `FAILED_CREATION` status.
 */
export declare class EnvironmentProvisioningFailed extends EnvironmentProvisioningFailed_base<{
    readonly environmentId: string;
    readonly status: string | undefined;
}> {
}
export declare const EnvironmentProvider: () => import("effect/Layer").Layer<Provider.Provider<Environment>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Environment.d.ts.map