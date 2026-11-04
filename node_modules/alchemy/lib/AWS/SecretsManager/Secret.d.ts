import * as secretsmanager from "@distilled.cloud/aws/secrets-manager";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface GenerateSecretStringProps extends secretsmanager.GetRandomPasswordRequest {
    /**
     * JSON template merged with the generated password.
     * @default "{}"
     */
    secretStringTemplate?: string;
    /**
     * Key written into the generated secret payload.
     * @default "password"
     */
    generateStringKey?: string;
}
export interface SecretProps {
    /**
     * Secret name. If omitted, Alchemy generates a deterministic physical name.
     */
    name?: string;
    /**
     * Optional description for the secret.
     */
    description?: string;
    /**
     * Optional KMS key used to encrypt the secret.
     */
    kmsKeyId?: string;
    /**
     * Plain string secret value.
     */
    secretString?: Redacted.Redacted<string>;
    /**
     * Binary secret value.
     */
    secretBinary?: Redacted.Redacted<Uint8Array<ArrayBufferLike>>;
    /**
     * Generate a password and store it inside a JSON secret string.
     */
    generateSecretString?: GenerateSecretStringProps;
    /**
     * Resource-based permission policy attached to the secret
     * (`PutResourcePolicy`). Accepts a typed {@link PolicyDocument} or a raw
     * JSON string as an escape hatch (e.g. for adoption of an existing
     * policy). Omitting the prop removes any policy previously attached by
     * Alchemy.
     */
    resourcePolicy?: PolicyDocument | string;
    /**
     * User-defined tags for the secret.
     */
    tags?: Record<string, string>;
}
export interface Secret extends Resource<"AWS.SecretsManager.Secret", SecretProps, {
    /**
     * ARN of the secret.
     */
    secretArn: string;
    /**
     * Name of the secret.
     */
    secretName: string;
    /**
     * Version ID of the `AWSCURRENT` secret value, if a value has been set.
     */
    versionId: string | undefined;
    /**
     * Description of the secret.
     */
    description: string | undefined;
    /**
     * KMS key ID (or ARN) used to encrypt the secret value, if a
     * customer-managed key was configured.
     */
    kmsKeyId: string | undefined;
    /**
     * Tags on the secret.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Secrets Manager secret.
 *
 * `Secret` owns the lifecycle of the secret metadata and current value. It can
 * store a caller-provided value or generate a password-backed JSON payload for
 * downstream resources such as Aurora clusters and RDS proxies.
 * ### Creating Secrets
 * **Example:** Static Secret String
 * ```typescript
 * const secret = yield* Secret("DbSecret", {
 *   secretString: Redacted.make(JSON.stringify({
 *     username: "app",
 *     password: "super-secret",
 *   })),
 * });
 * ```
 *
 * **Example:** Generated Password Secret
 * ```typescript
 * const secret = yield* Secret("DbSecret", {
 *   generateSecretString: {
 *     secretStringTemplate: JSON.stringify({ username: "app" }),
 *     generateStringKey: "password",
 *     PasswordLength: 32,
 *   },
 * });
 * ```
 *
 * ### Resource Policies
 * **Example:** Typed Resource Policy
 * ```typescript
 * const secret = yield* Secret("SharedSecret", {
 *   secretString: Redacted.make("shared-value"),
 *   resourcePolicy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: `arn:aws:iam::${accountId}:root` },
 *         Action: ["secretsmanager:GetSecretValue"],
 *         Resource: "*",
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Secret: import("../../Resource.ts").ResourceClass<Secret>;
export declare const SecretProvider: () => import("effect/Layer").Layer<Provider.Provider<Secret>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Secret.d.ts.map