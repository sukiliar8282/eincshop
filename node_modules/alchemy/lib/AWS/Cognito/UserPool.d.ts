import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Password complexity requirements enforced by the user pool at sign-up and
 * password change.
 */
export interface UserPoolPasswordPolicy {
    /**
     * Minimum password length (6-99).
     * @default 8
     */
    minimumLength?: number;
    /**
     * Require at least one uppercase letter.
     * @default true
     */
    requireUppercase?: boolean;
    /**
     * Require at least one lowercase letter.
     * @default true
     */
    requireLowercase?: boolean;
    /**
     * Require at least one number.
     * @default true
     */
    requireNumbers?: boolean;
    /**
     * Require at least one symbol.
     * @default true
     */
    requireSymbols?: boolean;
    /**
     * Number of previous passwords a user cannot reuse. Requires the
     * `ESSENTIALS` or `PLUS` feature tier.
     */
    passwordHistorySize?: number;
    /**
     * How long an admin-set temporary password stays valid, e.g.
     * `"7 days"` (0-365 days). Rounded to whole days on the wire
     * (`TemporaryPasswordValidityDays`).
     * @default 7 days
     */
    temporaryPasswordValidity?: Duration.Input;
}
/**
 * A custom schema attribute added to the user pool. Custom attributes are
 * automatically prefixed with `custom:` by Cognito. Attributes can be added
 * to an existing pool but never removed or changed — removing or modifying a
 * declared attribute triggers a replacement.
 */
export interface UserPoolSchemaAttribute {
    /**
     * Attribute name (without the `custom:` prefix; Cognito adds it).
     * 1-20 characters.
     */
    name: string;
    /**
     * The data type of the attribute.
     * @default "String"
     */
    attributeDataType?: "String" | "Number" | "DateTime" | "Boolean";
    /**
     * Whether users can change the value after it is set.
     * @default true
     */
    mutable?: boolean;
    /**
     * Whether the attribute is required at sign-up. Custom attributes cannot
     * be required.
     * @default false
     */
    required?: boolean;
    /**
     * Min/max length constraints for `String` attributes (stringified numbers,
     * matching the Cognito wire format).
     */
    stringConstraints?: {
        minLength?: string;
        maxLength?: string;
    };
    /**
     * Min/max value constraints for `Number` attributes (stringified numbers,
     * matching the Cognito wire format).
     */
    numberConstraints?: {
        minValue?: string;
        maxValue?: string;
    };
    /**
     * Developer-only attributes can only be modified with IAM credentials
     * (prefixed `dev:` in addition to `custom:`).
     * @default false
     */
    developerOnlyAttribute?: boolean;
}
/**
 * The user pool Lambda trigger slots that take a plain function ARN — the
 * string-valued keys of the pool's `LambdaConfig`. The versioned custom
 * sender slots are configured separately: `CustomEmailSender` through
 * {@link UserPoolProps.customEmailSender} (+ `kmsKeyId`); `CustomSMSSender`
 * is not modelled yet (an observed one is preserved, never cleared).
 */
export type UserPoolTriggerName = "PreSignUp" | "PostConfirmation" | "PreAuthentication" | "PostAuthentication" | "CustomMessage" | "DefineAuthChallenge" | "CreateAuthChallenge" | "VerifyAuthChallengeResponse" | "PreTokenGeneration" | "UserMigration";
/**
 * Lambda trigger configuration for the pool: each key is a trigger slot,
 * each value the ARN of the Lambda function Cognito invokes for it.
 * Usually populated through the trigger event source
 * (`Cognito.onPreSignUp(pool, ...)` etc.) rather than declared directly.
 */
export interface UserPoolLambdaConfig extends Partial<Record<UserPoolTriggerName, string>> {
}
/**
 * The binding contract of a user pool: event sources contribute
 * `LambdaConfig` trigger entries (trigger slot → function ARN) that the
 * provider merges with `props.lambdaConfig` and syncs onto the pool.
 */
export interface UserPoolBinding {
    /** Trigger entries injected by `Cognito.onUserPoolTrigger` and friends. */
    lambdaConfig?: UserPoolLambdaConfig;
}
declare const ConflictingUserPoolTrigger_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ConflictingUserPoolTrigger";
} & Readonly<A>;
/**
 * Two different Lambda functions were registered for the same user pool
 * trigger slot — Cognito supports exactly one function per trigger.
 */
export declare class ConflictingUserPoolTrigger extends ConflictingUserPoolTrigger_base<{
    readonly trigger: string;
    readonly functionArns: readonly string[];
}> {
}
declare const InvalidUserPoolConfiguration_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "InvalidUserPoolConfiguration";
} & Readonly<A>;
/**
 * The user pool's configuration is internally inconsistent (e.g. a custom
 * email sender without the KMS key Cognito needs to encrypt the codes it
 * hands to the function). Raised before any API call is made.
 */
export declare class InvalidUserPoolConfiguration extends InvalidUserPoolConfiguration_base<{
    readonly reason: string;
}> {
}
/**
 * A first-factor sign-in method for choice-based authentication.
 */
export type UserPoolAuthFactor = "PASSWORD" | "EMAIL_OTP" | "SMS_OTP" | "WEB_AUTHN";
/**
 * The sign-in policy of the pool — which first-factor authentication
 * methods users may start with (choice-based authentication). Requires the
 * `ESSENTIALS` or `PLUS` feature tier.
 */
export interface UserPoolSignInPolicy {
    /**
     * First-factor sign-in methods the pool allows. `PASSWORD` is the
     * classic username + password flow; `EMAIL_OTP` / `SMS_OTP` send a
     * one-time code (email OTP is delivered through `customEmailSender` when
     * one is configured); `WEB_AUTHN` is passkey sign-in.
     * Passwordless factors require the `ESSENTIALS` or `PLUS` tier.
     */
    allowedFirstAuthFactors?: UserPoolAuthFactor[];
}
/**
 * The `CustomEmailSender` Lambda trigger: Cognito invokes this function
 * instead of sending email itself, passing the verification / OTP code
 * encrypted with `kmsKeyId` (decrypt it with the AWS Encryption SDK).
 * Requires {@link UserPoolProps.kmsKeyId}. The function must also grant
 * `cognito-idp.amazonaws.com` invoke access (`AWS.Lambda.Permission`).
 */
export interface UserPoolCustomEmailSender {
    /** ARN of the Lambda function that delivers the pool's email messages. */
    lambdaArn: string;
    /**
     * The custom sender event version the function understands.
     * @default "V1_0"
     */
    lambdaVersion?: "V1_0";
}
/**
 * How the user pool delivers its email messages (verification codes, OTPs,
 * invitations): either Cognito's built-in, rate-limited delivery
 * (`COGNITO_DEFAULT`) or your own verified Amazon SES identity
 * (`DEVELOPER`). With `DEVELOPER`, the SES identity's policy must grant
 * `cognito-idp.amazonaws.com` permission to send
 * (`SES.EmailIdentityPolicy`).
 */
export interface UserPoolEmailConfiguration {
    /**
     * Which sending account delivers the pool's email. `COGNITO_DEFAULT`
     * uses Cognito's built-in delivery (limited daily volume);
     * `DEVELOPER` sends through your own SES identity (`sourceArn`
     * required) at your SES quota.
     * @default "COGNITO_DEFAULT"
     */
    emailSendingAccount?: "COGNITO_DEFAULT" | "DEVELOPER";
    /**
     * ARN of a verified SES email identity (address or domain) in a
     * supported region. Required when `emailSendingAccount` is `DEVELOPER`;
     * with `COGNITO_DEFAULT` it customizes the FROM address while Cognito
     * still handles delivery.
     */
    sourceArn?: string;
    /**
     * The FROM address, either bare (`no-reply@example.com`) or with a
     * friendly display name (`"My App <no-reply@example.com>"`). Must be
     * covered by the `sourceArn` identity.
     */
    from?: string;
    /**
     * The destination for replies to the pool's messages.
     */
    replyToEmailAddress?: string;
    /**
     * Name of an SES configuration set applied to email sent by the pool
     * (event publishing, IP pool selection). `DEVELOPER` only.
     */
    configurationSet?: string;
}
/**
 * An account recovery mechanism with its priority (1 is highest).
 */
export interface UserPoolRecoveryMechanism {
    /** Recovery channel. */
    name: "verified_email" | "verified_phone_number" | "admin_only";
    /** Priority of this mechanism; 1 is tried first. */
    priority: number;
}
export interface UserPoolProps {
    /**
     * Name of the user pool. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID.
     */
    poolName?: string;
    /**
     * Password complexity policy for the pool.
     */
    passwordPolicy?: UserPoolPasswordPolicy;
    /**
     * Attributes users may sign in with *instead of* a username
     * (`email` and/or `phone_number`). When set, Cognito generates an
     * immutable UUID username and the listed attributes become sign-in
     * identifiers. Mutually exclusive with `aliasAttributes`.
     * Changing this triggers a replacement.
     */
    usernameAttributes?: ("email" | "phone_number")[];
    /**
     * Attributes that may be used as sign-in aliases *in addition to* the
     * username (`email`, `phone_number`, `preferred_username`). Mutually
     * exclusive with `usernameAttributes`. Changing this triggers a
     * replacement.
     */
    aliasAttributes?: ("email" | "phone_number" | "preferred_username")[];
    /**
     * Attributes Cognito verifies automatically by sending a code
     * (`email` and/or `phone_number`). `phone_number` requires SMS (SNS)
     * configuration.
     */
    autoVerifiedAttributes?: ("email" | "phone_number")[];
    /**
     * Custom schema attributes. Attributes may be added to an existing pool;
     * removing or changing a declared attribute triggers a replacement.
     */
    schema?: UserPoolSchemaAttribute[];
    /**
     * Choice-based authentication: the first-factor sign-in methods users may
     * start with (`PASSWORD`, `EMAIL_OTP`, `SMS_OTP`, `WEB_AUTHN`). Requires
     * the `ESSENTIALS` or `PLUS` tier when any passwordless factor is listed.
     * When omitted the observed policy is left untouched.
     */
    signInPolicy?: UserPoolSignInPolicy;
    /**
     * Multi-factor authentication mode. `ON` requires SMS or TOTP setup for
     * every user; avoid SMS-based MFA unless the account has SNS spend
     * entitlements.
     * @default "OFF"
     */
    mfaConfiguration?: "OFF" | "OPTIONAL" | "ON";
    /**
     * Account recovery mechanisms in priority order.
     * @default verified_email then verified_phone_number
     */
    accountRecovery?: UserPoolRecoveryMechanism[];
    /**
     * When true the pool cannot be deleted until protection is disabled.
     * @default false
     */
    deletionProtection?: boolean;
    /**
     * When true, only administrators (via `AdminCreateUser`) can create
     * users — public `SignUp` is disabled.
     * @default false
     */
    adminCreateUserOnly?: boolean;
    /**
     * Whether usernames are case sensitive. Changing this triggers a
     * replacement.
     * @default true (the API default)
     */
    usernameCaseSensitive?: boolean;
    /**
     * The feature tier of the user pool.
     * @default "ESSENTIALS"
     */
    tier?: "LITE" | "ESSENTIALS" | "PLUS";
    /**
     * Lambda trigger configuration (trigger slot → function ARN). Merged with
     * trigger entries injected through the binding contract by
     * `Cognito.onUserPoolTrigger` / `onPreSignUp` / etc. — prefer those over
     * declaring ARNs here, since the event source also creates the invoke
     * Permission and registers the runtime handler.
     */
    lambdaConfig?: UserPoolLambdaConfig;
    /**
     * Route the pool's email messages (sign-up / OTP / recovery codes,
     * temporary passwords) through your own Lambda function instead of
     * Cognito's built-in delivery. Requires `kmsKeyId`. Omitting this on an
     * existing pool clears the custom sender (Cognito falls back to its own
     * email delivery); ordinary triggers and the other pool settings are
     * never affected by adding or removing it.
     */
    customEmailSender?: UserPoolCustomEmailSender;
    /**
     * How the pool delivers its email messages: Cognito's built-in delivery
     * (`COGNITO_DEFAULT`, the service default) or a verified SES identity
     * (`DEVELOPER`) — no custom sender Lambda required. When omitted, an
     * observed email configuration is preserved rather than reset to the
     * service default.
     */
    emailConfiguration?: UserPoolEmailConfiguration;
    /**
     * ARN of the symmetric KMS key Cognito uses to encrypt the codes it
     * passes to the custom sender function(s) (`LambdaConfig.KMSKeyID`).
     * The principal running the deploy must hold `kms:CreateGrant` on the
     * key — Cognito creates a grant against it when the pool is configured —
     * and the sender function's role needs `kms:Decrypt`.
     */
    kmsKeyId?: string;
    /**
     * Tags to apply to the user pool. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface UserPool extends Resource<"AWS.Cognito.UserPool", UserPoolProps, {
    /** The generated ID of the user pool, e.g. `us-west-2_AbCdEfGhI`. */
    userPoolId: string;
    /** The ARN of the user pool. */
    userPoolArn: string;
    /** The name of the user pool. */
    userPoolName: string;
}, UserPoolBinding, Providers> {
}
/**
 * An Amazon Cognito user pool — a managed user directory that handles
 * sign-up, sign-in, and token issuance (OIDC-compliant JWTs) for your
 * application.
 * ### Creating a User Pool
 * **Example:** Basic User Pool
 * ```typescript
 * import * as Cognito from "alchemy/AWS/Cognito";
 *
 * const pool = yield* Cognito.UserPool("Users", {});
 * ```
 *
 * **Example:** Email Sign-In with Password Policy
 * ```typescript
 * const pool = yield* Cognito.UserPool("Users", {
 *   usernameAttributes: ["email"],
 *   autoVerifiedAttributes: ["email"],
 *   passwordPolicy: {
 *     minimumLength: 12,
 *     requireSymbols: false,
 *   },
 * });
 * ```
 *
 * **Example:** Admin-Only User Creation
 * ```typescript
 * const pool = yield* Cognito.UserPool("Users", {
 *   adminCreateUserOnly: true,
 *   accountRecovery: [{ name: "admin_only", priority: 1 }],
 * });
 * ```
 *
 * ### Custom Attributes
 * **Example:** Pool with Custom Schema Attributes
 * ```typescript
 * const pool = yield* Cognito.UserPool("Users", {
 *   schema: [
 *     { name: "tenantId", mutable: false },
 *     { name: "plan", attributeDataType: "String" },
 *   ],
 * });
 * ```
 *
 * ### Sending Email Through SES
 * **Example:** OTP and Verification Email from a Verified SES Identity
 * ```typescript
 * const identity = yield* SES.EmailIdentity("Sender", {
 *   emailIdentity: "mail.example.com",
 * });
 * // allow Cognito to send through the identity
 * yield* SES.EmailIdentityPolicy("CognitoSend", {
 *   emailIdentity: identity.emailIdentity,
 *   policyName: "cognito",
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "cognito-idp.amazonaws.com" },
 *       Action: ["ses:SendEmail", "ses:SendRawEmail"],
 *       Resource: identity.identityArn,
 *     }],
 *   },
 * });
 * const pool = yield* Cognito.UserPool("Users", {
 *   usernameAttributes: ["email"],
 *   autoVerifiedAttributes: ["email"],
 *   emailConfiguration: {
 *     emailSendingAccount: "DEVELOPER",
 *     sourceArn: identity.identityArn,
 *     from: "My App <no-reply@mail.example.com>",
 *     replyToEmailAddress: "support@example.com",
 *   },
 * });
 * ```
 *
 * ### Email OTP with a Custom Email Sender
 * **Example:** Passwordless Email OTP Delivered by Your Own Lambda
 * ```typescript
 * const key = yield* KMS.Key("CodeKey", {});
 * const sender = yield* Lambda.Function("EmailSender", {
 *   main: import.meta.url,
 * });
 * yield* Lambda.Permission("CognitoInvoke", {
 *   functionName: sender.functionName,
 *   action: "lambda:InvokeFunction",
 *   principal: "cognito-idp.amazonaws.com",
 * });
 * const pool = yield* Cognito.UserPool("Auth", {
 *   tier: "ESSENTIALS",
 *   usernameAttributes: ["email"],
 *   signInPolicy: { allowedFirstAuthFactors: ["PASSWORD", "EMAIL_OTP"] },
 *   customEmailSender: { lambdaArn: sender.functionArn },
 *   kmsKeyId: key.keyArn,
 * });
 * ```
 *
 * ### App Clients and Auth
 * **Example:** Pool with an App Client
 * ```typescript
 * const pool = yield* Cognito.UserPool("Users", {});
 * const client = yield* Cognito.UserPoolClient("Web", {
 *   userPoolId: pool.userPoolId,
 *   explicitAuthFlows: ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"],
 * });
 * ```
 *
 * @resource
 */
export declare const UserPool: import("../../Resource.ts").ResourceClass<UserPool>;
export declare const UserPoolProvider: () => import("effect/Layer").Layer<Provider.Provider<UserPool>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=UserPool.d.ts.map