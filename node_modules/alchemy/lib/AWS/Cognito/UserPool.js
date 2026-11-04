import * as cip from "@distilled.cloud/aws/cognito-identity-provider";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
import { toWireDays } from "../../Util/Duration.js";
const USER_POOL_TRIGGER_NAMES = [
    "PreSignUp",
    "PostConfirmation",
    "PreAuthentication",
    "PostAuthentication",
    "CustomMessage",
    "DefineAuthChallenge",
    "CreateAuthChallenge",
    "VerifyAuthChallengeResponse",
    "PreTokenGeneration",
    "UserMigration",
];
/**
 * Two different Lambda functions were registered for the same user pool
 * trigger slot — Cognito supports exactly one function per trigger.
 */
export class ConflictingUserPoolTrigger extends Data.TaggedError("ConflictingUserPoolTrigger") {
}
/**
 * The user pool's configuration is internally inconsistent (e.g. a custom
 * email sender without the KMS key Cognito needs to encrypt the codes it
 * hands to the function). Raised before any API call is made.
 */
export class InvalidUserPoolConfiguration extends Data.TaggedError("InvalidUserPoolConfiguration") {
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
export const UserPool = Resource("AWS.Cognito.UserPool");
/** Map camelCase password policy props to the Cognito wire shape (the wire
 * unit for `TemporaryPasswordValidityDays` is whole days). */
const toWirePasswordPolicy = (policy) => policy === undefined
    ? undefined
    : {
        MinimumLength: policy.minimumLength,
        RequireUppercase: policy.requireUppercase,
        RequireLowercase: policy.requireLowercase,
        RequireNumbers: policy.requireNumbers,
        RequireSymbols: policy.requireSymbols,
        PasswordHistorySize: policy.passwordHistorySize,
        TemporaryPasswordValidityDays: toWireDays(policy.temporaryPasswordValidity),
    };
const toWireSchemaAttribute = (attribute) => ({
    Name: attribute.name,
    AttributeDataType: attribute.attributeDataType ?? "String",
    Mutable: attribute.mutable ?? true,
    Required: attribute.required ?? false,
    DeveloperOnlyAttribute: attribute.developerOnlyAttribute,
    StringAttributeConstraints: attribute.stringConstraints === undefined
        ? undefined
        : {
            MinLength: attribute.stringConstraints.minLength,
            MaxLength: attribute.stringConstraints.maxLength,
        },
    NumberAttributeConstraints: attribute.numberConstraints === undefined
        ? undefined
        : {
            MinValue: attribute.numberConstraints.minValue,
            MaxValue: attribute.numberConstraints.maxValue,
        },
});
const toWireAccountRecovery = (mechanisms) => mechanisms === undefined
    ? undefined
    : {
        RecoveryMechanisms: mechanisms.map((m) => ({
            Name: m.name,
            Priority: m.priority,
        })),
    };
const toWireSignInPolicy = (policy) => policy === undefined
    ? undefined
    : { AllowedFirstAuthFactors: policy.allowedFirstAuthFactors };
const toWireEmailConfiguration = (config) => config === undefined
    ? undefined
    : {
        EmailSendingAccount: config.emailSendingAccount ?? "COGNITO_DEFAULT",
        SourceArn: config.sourceArn,
        From: config.from,
        ReplyToEmailAddress: config.replyToEmailAddress,
        ConfigurationSet: config.configurationSet,
    };
/** Observed/desired email configuration with the service default filled in,
 * for order- and absence-insensitive comparison (`JSON.stringify` drops the
 * `undefined` members on both sides). */
const normalizedEmailConfiguration = (config) => ({
    emailSendingAccount: config?.EmailSendingAccount ?? "COGNITO_DEFAULT",
    sourceArn: config?.SourceArn,
    from: config?.From,
    replyToEmailAddress: config?.ReplyToEmailAddress,
    configurationSet: config?.ConfigurationSet,
});
const toWireCustomEmailSender = (sender) => sender === undefined
    ? undefined
    : {
        LambdaArn: sender.lambdaArn,
        LambdaVersion: sender.lambdaVersion ?? "V1_0",
    };
const PASSWORDLESS_AUTH_FACTORS = [
    "EMAIL_OTP",
    "SMS_OTP",
    "WEB_AUTHN",
];
/**
 * Reject configurations Cognito would refuse (or silently mangle) before
 * any API call is made.
 */
const validateProps = (props) => props.customEmailSender !== undefined && props.kmsKeyId === undefined
    ? Effect.fail(new InvalidUserPoolConfiguration({
        reason: "customEmailSender requires kmsKeyId — Cognito encrypts the codes it passes to the custom sender with that KMS key",
    }))
    : props.emailConfiguration?.emailSendingAccount === "DEVELOPER" &&
        props.emailConfiguration.sourceArn === undefined
        ? Effect.fail(new InvalidUserPoolConfiguration({
            reason: "emailConfiguration with emailSendingAccount DEVELOPER requires sourceArn — the ARN of the verified SES identity Cognito sends from",
        }))
        : props.tier === "LITE" &&
            (props.signInPolicy?.allowedFirstAuthFactors ?? []).some((factor) => PASSWORDLESS_AUTH_FACTORS.includes(factor))
            ? Effect.fail(new InvalidUserPoolConfiguration({
                reason: "passwordless first-auth factors (EMAIL_OTP / SMS_OTP / WEB_AUTHN) require the ESSENTIALS or PLUS tier, not LITE",
            }))
            : Effect.void;
const tagRecordOf = (tags) => Object.fromEntries(Object.entries(tags ?? {}).filter((entry) => entry[1] !== undefined));
/**
 * The wire name an observed pool attribute would have for a declared custom
 * schema attribute (Cognito prefixes `custom:`, or `dev:custom:` for
 * developer-only attributes).
 */
const customAttributeWireName = (attribute) => attribute.developerOnlyAttribute
    ? `dev:custom:${attribute.name}`
    : `custom:${attribute.name}`;
const schemaAttributeChanged = (before, after) => JSON.stringify(toWireSchemaAttribute(before)) !==
    JSON.stringify(toWireSchemaAttribute(after));
export const UserPoolProvider = () => Provider.effect(UserPool, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.poolName ?? (yield* createPhysicalName({ id, maxLength: 128 })));
    });
    const describePool = Effect.fn(function* (userPoolId) {
        return yield* cip.describeUserPool({ UserPoolId: userPoolId }).pipe(Effect.map((r) => r.UserPool), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    /**
     * Find a pool by exact name. Pool names are not unique, so return every
     * candidate — callers disambiguate by ownership tags.
     */
    const findPoolsByName = Effect.fn(function* (name) {
        const pages = yield* cip.listUserPools
            .pages({ MaxResults: 60 })
            .pipe(Stream.runCollect);
        const candidates = Array.from(pages)
            .flatMap((page) => page.UserPools ?? [])
            .filter((pool) => pool.Name === name && pool.Id !== undefined);
        return yield* Effect.forEach(candidates, (candidate) => describePool(candidate.Id), { concurrency: 3 }).pipe(Effect.map((pools) => pools.filter((pool) => pool !== undefined)));
    });
    const attributesOf = (pool) => ({
        userPoolId: pool.Id,
        userPoolArn: pool.Arn,
        userPoolName: pool.Name,
    });
    /**
     * The pool's desired trigger slots: `props.lambdaConfig` merged with
     * the trigger entries contributed through the binding contract
     * (`Cognito.onUserPoolTrigger` and friends). Fails when two different
     * function ARNs target the same trigger slot.
     */
    const resolveTriggers = Effect.fn(function* (news, bindings) {
        const merged = {};
        const contributions = [
            news.lambdaConfig,
            ...bindings.map((binding) => binding.data?.lambdaConfig ??
                binding.lambdaConfig),
        ];
        for (const config of contributions) {
            if (config === undefined)
                continue;
            for (const trigger of USER_POOL_TRIGGER_NAMES) {
                const arn = config[trigger];
                if (arn === undefined)
                    continue;
                const existing = merged[trigger];
                if (existing !== undefined && existing !== arn) {
                    return yield* Effect.fail(new ConflictingUserPoolTrigger({
                        trigger,
                        functionArns: [existing, arn],
                    }));
                }
                merged[trigger] = arn;
            }
        }
        return merged;
    });
    /**
     * The full desired `LambdaConfig` wire shape: the string trigger slots
     * plus the versioned `CustomEmailSender` + `KMSKeyID` from props. The
     * provider owns `LambdaConfig` outright, so a trigger or custom sender
     * removed from the program is cleared on the pool. The one exception
     * is `CustomSMSSender`, which the props cannot express yet: an
     * observed one (and the KMS key it needs) is carried over rather than
     * wiped by an unrelated update. Returns `undefined` when nothing is
     * desired (omitting `LambdaConfig` clears it on both create and
     * update).
     */
    const desiredLambdaConfig = (news, triggers, observed) => {
        const customSMSSender = observed?.CustomSMSSender;
        const config = {
            ...triggers,
            CustomEmailSender: toWireCustomEmailSender(news.customEmailSender),
            CustomSMSSender: customSMSSender,
            KMSKeyID: news.kmsKeyId ??
                (customSMSSender !== undefined ? observed?.KMSKeyID : undefined),
        };
        const present = Object.fromEntries(Object.entries(config).filter(([, value]) => value !== undefined));
        return Object.keys(present).length > 0 ? present : undefined;
    };
    /** True when the managed parts of the observed `LambdaConfig` differ
     * from the desired one. */
    const lambdaConfigDrifted = (desired, observed) => {
        for (const trigger of USER_POOL_TRIGGER_NAMES) {
            if (desired?.[trigger] !== observed?.[trigger])
                return true;
        }
        if (desired?.CustomEmailSender?.LambdaArn !==
            observed?.CustomEmailSender?.LambdaArn ||
            desired?.CustomEmailSender?.LambdaVersion !==
                observed?.CustomEmailSender?.LambdaVersion) {
            return true;
        }
        return desired?.KMSKeyID !== observed?.KMSKeyID;
    };
    /** The update body sent to `updateUserPool` — always the full desired
     * state, because Cognito resets any omitted field to its default.
     * Props the user left undefined are "don't care" (see `hasDrift`), so
     * their OBSERVED value is echoed back rather than dropped — an update
     * to one setting must not reset another to its default. */
    const desiredUpdate = (news, observed, lambdaConfig) => {
        const PasswordPolicy = news.passwordPolicy === undefined
            ? observed.Policies?.PasswordPolicy
            : toWirePasswordPolicy(news.passwordPolicy);
        const SignInPolicy = news.signInPolicy === undefined
            ? observed.Policies?.SignInPolicy
            : toWireSignInPolicy(news.signInPolicy);
        return {
            LambdaConfig: lambdaConfig,
            // updateUserPool resets an omitted EmailConfiguration to the
            // service default — echo the OBSERVED configuration back when the
            // prop is undefined so unrelated updates never clear it.
            EmailConfiguration: news.emailConfiguration === undefined
                ? observed.EmailConfiguration
                : toWireEmailConfiguration(news.emailConfiguration),
            Policies: PasswordPolicy === undefined && SignInPolicy === undefined
                ? undefined
                : { PasswordPolicy, SignInPolicy },
            DeletionProtection: news.deletionProtection ? "ACTIVE" : "INACTIVE",
            AutoVerifiedAttributes: news.autoVerifiedAttributes ?? observed.AutoVerifiedAttributes,
            MfaConfiguration: news.mfaConfiguration ?? "OFF",
            AdminCreateUserConfig: news.adminCreateUserOnly === undefined
                ? observed.AdminCreateUserConfig === undefined
                    ? undefined
                    : {
                        // never echo the deprecated UnusedAccountValidityDays —
                        // Cognito rejects it next to TemporaryPasswordValidityDays
                        AllowAdminCreateUserOnly: observed.AdminCreateUserConfig.AllowAdminCreateUserOnly,
                        InviteMessageTemplate: observed.AdminCreateUserConfig.InviteMessageTemplate,
                    }
                : { AllowAdminCreateUserOnly: news.adminCreateUserOnly },
            AccountRecoverySetting: news.accountRecovery === undefined
                ? observed.AccountRecoverySetting
                : toWireAccountRecovery(news.accountRecovery),
            UserPoolTier: news.tier ?? observed.UserPoolTier,
        };
    };
    /** Canonicalize a recovery-mechanism list for order-insensitive
     * comparison. */
    const canonicalRecovery = (mechanisms) => mechanisms
        .map((m) => `${m.priority}:${m.name}`)
        .sort()
        .join(",");
    /** Full password policy with the Cognito API defaults filled in, so a
     * partial desired policy compares fairly against the observed one.
     * Operates on the wire shape — `temporaryPasswordValidityDays` is a
     * whole number of days (desired durations are converted first). */
    const normalizedPasswordPolicy = (policy) => ({
        minimumLength: policy.minimumLength ?? 8,
        requireUppercase: policy.requireUppercase ?? true,
        requireLowercase: policy.requireLowercase ?? true,
        requireNumbers: policy.requireNumbers ?? true,
        requireSymbols: policy.requireSymbols ?? true,
        passwordHistorySize: policy.passwordHistorySize,
        temporaryPasswordValidityDays: policy.temporaryPasswordValidityDays ?? 7,
    });
    /** True when the observed pool differs from the desired mutable state.
     * Props the user left undefined are "don't care" and never drift —
     * except `LambdaConfig`, which the provider owns outright (bindings
     * contribute to it), so a trigger or custom sender removed from the
     * program is drift that clears the observed entry. */
    const hasDrift = (news, observed, lambdaConfig) => {
        if (lambdaConfigDrifted(lambdaConfig, observed.LambdaConfig)) {
            return true;
        }
        if (news.signInPolicy?.allowedFirstAuthFactors !== undefined &&
            [...news.signInPolicy.allowedFirstAuthFactors].sort().join(",") !==
                [
                    ...(observed.Policies?.SignInPolicy?.AllowedFirstAuthFactors ??
                        []),
                ]
                    .sort()
                    .join(",")) {
            return true;
        }
        if (news.passwordPolicy !== undefined) {
            const desired = normalizedPasswordPolicy({
                ...news.passwordPolicy,
                temporaryPasswordValidityDays: toWireDays(news.passwordPolicy.temporaryPasswordValidity),
            });
            const actual = normalizedPasswordPolicy({
                minimumLength: observed.Policies?.PasswordPolicy?.MinimumLength,
                requireUppercase: observed.Policies?.PasswordPolicy?.RequireUppercase,
                requireLowercase: observed.Policies?.PasswordPolicy?.RequireLowercase,
                requireNumbers: observed.Policies?.PasswordPolicy?.RequireNumbers,
                requireSymbols: observed.Policies?.PasswordPolicy?.RequireSymbols,
                passwordHistorySize: observed.Policies?.PasswordPolicy?.PasswordHistorySize,
                temporaryPasswordValidityDays: observed.Policies?.PasswordPolicy?.TemporaryPasswordValidityDays,
            });
            if (JSON.stringify(desired) !== JSON.stringify(actual))
                return true;
        }
        if ((news.deletionProtection ? "ACTIVE" : "INACTIVE") !==
            (observed.DeletionProtection ?? "INACTIVE")) {
            return true;
        }
        if (news.autoVerifiedAttributes !== undefined &&
            [...news.autoVerifiedAttributes].sort().join(",") !==
                [...(observed.AutoVerifiedAttributes ?? [])].sort().join(",")) {
            return true;
        }
        if ((news.mfaConfiguration ?? "OFF") !==
            (observed.MfaConfiguration ?? "OFF")) {
            return true;
        }
        if (news.emailConfiguration !== undefined &&
            JSON.stringify(normalizedEmailConfiguration(toWireEmailConfiguration(news.emailConfiguration))) !==
                JSON.stringify(normalizedEmailConfiguration(observed.EmailConfiguration))) {
            return true;
        }
        if (news.adminCreateUserOnly !== undefined &&
            news.adminCreateUserOnly !==
                (observed.AdminCreateUserConfig?.AllowAdminCreateUserOnly ?? false)) {
            return true;
        }
        if (news.accountRecovery !== undefined &&
            canonicalRecovery(news.accountRecovery) !==
                canonicalRecovery((observed.AccountRecoverySetting?.RecoveryMechanisms ?? []).map((m) => ({ priority: m.Priority, name: m.Name })))) {
            return true;
        }
        if (news.tier !== undefined && news.tier !== observed.UserPoolTier) {
            return true;
        }
        return false;
    };
    return UserPool.Provider.of({
        stables: ["userPoolId", "userPoolArn"],
        list: () => Effect.gen(function* () {
            const pages = yield* cip.listUserPools
                .pages({ MaxResults: 60 })
                .pipe(Stream.runCollect);
            const descriptions = Array.from(pages).flatMap((page) => page.UserPools ?? []);
            const pools = yield* Effect.forEach(descriptions.filter((d) => d.Id !== undefined), (d) => describePool(d.Id), { concurrency: 5 });
            return pools
                .filter((pool) => pool !== undefined)
                .map((pool) => attributesOf(pool));
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            if (output?.userPoolId !== undefined) {
                const pool = yield* describePool(output.userPoolId);
                if (pool === undefined)
                    return undefined;
                const attrs = attributesOf(pool);
                const tags = tagRecordOf(pool.UserPoolTags);
                return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
            }
            const name = yield* createName(id, olds ?? {});
            const pools = yield* findPoolsByName(name);
            if (pools.length === 0)
                return undefined;
            for (const pool of pools) {
                if (yield* hasAlchemyTags(id, tagRecordOf(pool.UserPoolTags))) {
                    return attributesOf(pool);
                }
            }
            return Unowned(attributesOf(pools[0]));
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds ?? {});
            const newName = yield* createName(id, news ?? {});
            if (oldName !== newName)
                return { action: "replace" };
            // sign-in configuration is immutable
            if (JSON.stringify(olds?.usernameAttributes ?? []) !==
                JSON.stringify(news?.usernameAttributes ?? []) ||
                JSON.stringify(olds?.aliasAttributes ?? []) !==
                    JSON.stringify(news?.aliasAttributes ?? []) ||
                (olds?.usernameCaseSensitive ?? true) !==
                    (news?.usernameCaseSensitive ?? true)) {
                return { action: "replace" };
            }
            // schema attributes are add-only: removal or mutation ⇒ replace
            const oldSchema = olds?.schema ?? [];
            const newSchema = news?.schema ?? [];
            for (const before of oldSchema) {
                const after = newSchema.find((a) => a.name === before.name);
                if (after === undefined || schemaAttributeChanged(before, after)) {
                    return { action: "replace" };
                }
            }
        }),
        reconcile: Effect.fn(function* ({ id, news = {}, output, session, bindings, }) {
            yield* validateProps(news);
            const name = output?.userPoolName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            const triggers = yield* resolveTriggers(news, bindings);
            // 1. OBSERVE — output.userPoolId is only a cache; fall back to a
            //    name search so out-of-band deletes and adoption converge.
            let observed = output?.userPoolId !== undefined
                ? yield* describePool(output.userPoolId)
                : undefined;
            if (observed === undefined) {
                // Recover from state loss by name — only take over a pool that
                // carries our ownership tags (adoption flows arrive with output
                // set, not through this path).
                const candidates = yield* findPoolsByName(name);
                for (const candidate of candidates) {
                    if (yield* hasAlchemyTags(id, tagRecordOf(candidate.UserPoolTags))) {
                        observed = candidate;
                        break;
                    }
                }
            }
            // 2. ENSURE — create when missing.
            if (observed === undefined) {
                observed = yield* cip
                    .createUserPool({
                    PoolName: name,
                    LambdaConfig: desiredLambdaConfig(news, triggers, undefined),
                    Policies: news.passwordPolicy === undefined &&
                        news.signInPolicy === undefined
                        ? undefined
                        : {
                            PasswordPolicy: toWirePasswordPolicy(news.passwordPolicy),
                            SignInPolicy: toWireSignInPolicy(news.signInPolicy),
                        },
                    DeletionProtection: news.deletionProtection
                        ? "ACTIVE"
                        : "INACTIVE",
                    EmailConfiguration: toWireEmailConfiguration(news.emailConfiguration),
                    UsernameAttributes: news.usernameAttributes,
                    AliasAttributes: news.aliasAttributes,
                    AutoVerifiedAttributes: news.autoVerifiedAttributes,
                    Schema: news.schema?.map(toWireSchemaAttribute),
                    MfaConfiguration: news.mfaConfiguration ?? "OFF",
                    AdminCreateUserConfig: news.adminCreateUserOnly === undefined
                        ? undefined
                        : { AllowAdminCreateUserOnly: news.adminCreateUserOnly },
                    AccountRecoverySetting: toWireAccountRecovery(news.accountRecovery),
                    UsernameConfiguration: news.usernameCaseSensitive === undefined
                        ? undefined
                        : { CaseSensitive: news.usernameCaseSensitive },
                    UserPoolTier: news.tier,
                    UserPoolTags: desiredTags,
                })
                    .pipe(Effect.map((r) => r.UserPool));
            }
            else {
                // 3. SYNC — updateUserPool resets omitted fields to defaults, so
                //    the body is always the full desired mutable state; skip the
                //    call entirely when nothing drifted.
                const lambdaConfig = desiredLambdaConfig(news, triggers, observed.LambdaConfig);
                if (hasDrift(news, observed, lambdaConfig)) {
                    yield* cip.updateUserPool({
                        UserPoolId: observed.Id,
                        ...desiredUpdate(news, observed, lambdaConfig),
                    });
                }
                // 3b. SYNC SCHEMA — custom attributes are add-only.
                const observedNames = new Set((observed.SchemaAttributes ?? [])
                    .map((attribute) => attribute.Name)
                    .filter((n) => n !== undefined));
                const missing = (news.schema ?? []).filter((attribute) => !observedNames.has(customAttributeWireName(attribute)) &&
                    !observedNames.has(attribute.name));
                if (missing.length > 0) {
                    yield* cip.addCustomAttributes({
                        UserPoolId: observed.Id,
                        CustomAttributes: missing.map(toWireSchemaAttribute),
                    });
                }
            }
            const userPoolId = observed.Id;
            const userPoolArn = observed.Arn;
            // 3c. SYNC TAGS — diff against OBSERVED cloud tags so adoption
            //     converges (never olds/output).
            const observedTags = yield* cip
                .listTagsForResource({ ResourceArn: userPoolArn })
                .pipe(Effect.map((r) => tagRecordOf(r.Tags)), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({})));
            const { upsert, removed } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* cip.tagResource({
                    ResourceArn: userPoolArn,
                    Tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                });
            }
            if (removed.length > 0) {
                yield* cip.untagResource({
                    ResourceArn: userPoolArn,
                    TagKeys: removed,
                });
            }
            yield* session.note(userPoolId);
            return { userPoolId, userPoolArn, userPoolName: name };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* cip
                .deleteUserPool({ UserPoolId: output.userPoolId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=UserPool.js.map