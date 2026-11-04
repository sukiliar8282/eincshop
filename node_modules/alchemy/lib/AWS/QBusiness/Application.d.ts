import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type ApplicationStatus = qbusiness.ApplicationStatus;
export type IdentityType = qbusiness.IdentityType;
/**
 * Encryption-at-rest configuration for an Amazon Q Business application.
 */
export interface ApplicationEncryptionConfiguration {
    /**
     * The identifier of the customer-managed KMS key. Amazon Q Business does
     * not support asymmetric keys.
     */
    kmsKeyId?: string;
}
export interface ApplicationProps {
    /**
     * Display name of the application.
     * @default ${app}-${stage}-${id}
     */
    displayName?: string;
    /**
     * The authentication type the application connects users with.
     * `AWS_IAM_IDC` (IAM Identity Center) is the default and requires
     * `identityCenterInstanceArn`. Changing it replaces the application.
     * @default "AWS_IAM_IDC"
     */
    identityType?: IdentityType;
    /**
     * ARN of the IAM Identity Center instance the application connects to.
     * Required when `identityType` is `AWS_IAM_IDC` (the default).
     */
    identityCenterInstanceArn?: string;
    /**
     * ARN of an IAM identity provider (SAML/OIDC) when `identityType` is
     * `AWS_IAM_IDP_SAML` or `AWS_IAM_IDP_OIDC`. Changing it replaces the
     * application.
     */
    iamIdentityProviderArn?: string;
    /**
     * OIDC client IDs when `identityType` is `AWS_IAM_IDP_OIDC`. Changing
     * them replaces the application.
     */
    clientIdsForOIDC?: string[];
    /**
     * ARN of the IAM role Amazon Q Business assumes to publish CloudWatch
     * logs and metrics.
     */
    roleArn?: string;
    /**
     * A description of the application.
     */
    description?: string;
    /**
     * Encryption-at-rest configuration. Changing it replaces the application.
     */
    encryptionConfiguration?: ApplicationEncryptionConfiguration;
    /**
     * Whether end users can upload files directly into chat conversations.
     */
    attachmentsConfiguration?: qbusiness.AttachmentsConfiguration;
    /**
     * Whether end users can create and use Amazon Q Apps.
     */
    qAppsConfiguration?: qbusiness.QAppsConfiguration;
    /**
     * Whether Amazon Q Business personalizes chat responses using details
     * from the user's IAM Identity Center profile.
     */
    personalizationConfiguration?: qbusiness.PersonalizationConfiguration;
    /**
     * Automatic-subscription settings for users of the application.
     */
    autoSubscriptionConfiguration?: qbusiness.AutoSubscriptionConfiguration;
    /**
     * Amazon QuickSight identity configuration, when `identityType` is
     * `AWS_QUICKSIGHT_IDP`. Changing it replaces the application.
     */
    quickSightConfiguration?: qbusiness.QuickSightConfiguration;
    /**
     * Tags to associate with the application.
     */
    tags?: Record<string, string>;
}
export interface Application extends Resource<"AWS.QBusiness.Application", ApplicationProps, {
    /**
     * Service-assigned unique identifier of the application.
     */
    applicationId: string;
    /**
     * ARN of the application.
     */
    applicationArn: string;
    /**
     * The application's display name.
     */
    displayName: string;
    /**
     * Current lifecycle status of the application.
     */
    status: ApplicationStatus | undefined;
    /**
     * The authentication type the application was created with.
     */
    identityType: IdentityType | undefined;
    /**
     * ARN of the IAM Identity Center application created for this Amazon Q
     * Business application (when `identityType` is `AWS_IAM_IDC`).
     */
    identityCenterApplicationArn: string | undefined;
    /**
     * ARN of the IAM role used for CloudWatch logs/metrics.
     */
    roleArn: string | undefined;
    /**
     * Current tags reported for the application.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Q Business application — the top-level container that indices,
 * retrievers, data sources, and web experiences attach to.
 *
 * :::caution
 * Creating an application with the default `AWS_IAM_IDC` identity type
 * requires an IAM Identity Center instance in the account (pass its ARN as
 * `identityCenterInstanceArn`).
 * :::
 * ### Creating Applications
 * **Example:** Identity Center Application
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const app = yield* AWS.QBusiness.Application("Assistant", {
 *   identityCenterInstanceArn: "arn:aws:sso:::instance/ssoins-1234567890abcdef",
 *   description: "Company knowledge assistant",
 * });
 * ```
 *
 * **Example:** Anonymous Application
 * ```typescript
 * const app = yield* AWS.QBusiness.Application("PublicAssistant", {
 *   identityType: "ANONYMOUS",
 * });
 * ```
 *
 * @resource
 */
export declare const Application: import("../../Resource.ts").ResourceClass<Application>;
declare const ApplicationProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ApplicationProvisioningFailed";
} & Readonly<A>;
/**
 * An application whose asynchronous provisioning converged to the terminal
 * `FAILED` status.
 */
export declare class ApplicationProvisioningFailed extends ApplicationProvisioningFailed_base<{
    readonly applicationId: string;
    readonly message: string | undefined;
}> {
}
export declare const ApplicationProvider: () => import("effect/Layer").Layer<Provider.Provider<Application>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Application.d.ts.map