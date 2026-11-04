import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * The kind of value the parameter stores.
 *
 * - `String` — plain text value (the default).
 * - `StringList` — comma-separated list of values.
 * - `SecureString` — value encrypted at rest with a KMS key.
 */
export type ParameterType = "String" | "StringList" | "SecureString";
/**
 * The parameter tier. `Standard` parameters are free (up to 10,000 per
 * account, 4 KB values). `Advanced` parameters cost money but allow larger
 * values (8 KB), higher counts, and parameter policies. `Intelligent-Tiering`
 * lets Systems Manager pick the tier per request.
 */
export type ParameterTier = "Standard" | "Advanced" | "Intelligent-Tiering";
export interface ParameterProps {
    /**
     * The fully qualified name of the parameter (may be a hierarchical path
     * such as `/my-app/prod/db-url`). If omitted, a deterministic physical
     * name is generated from the app, stage, and logical ID.
     */
    name?: string;
    /**
     * The type of the parameter.
     * @default "String"
     */
    type?: ParameterType;
    /**
     * The parameter value. Accepts a plain string or a `Redacted` string —
     * use `Redacted.make(...)` for `SecureString` values so they never leak
     * into logs.
     */
    value: string | Redacted.Redacted<string>;
    /**
     * Description of the parameter.
     */
    description?: string;
    /**
     * The parameter tier. Note: downgrading an `Advanced` parameter back to
     * `Standard` is not supported by the API and triggers a replacement.
     * @default "Standard"
     */
    tier?: ParameterTier;
    /**
     * The KMS key ID, alias (e.g. `alias/my-key`), or ARN used to encrypt a
     * `SecureString` parameter. Only valid when `type` is `SecureString`.
     * @default "alias/aws/ssm" (the AWS-managed key)
     */
    keyId?: string;
    /**
     * A regular expression the parameter value must match, e.g. `^\d+$`.
     */
    allowedPattern?: string;
    /**
     * The data type for a `String` parameter. Use `aws:ec2:image` to have
     * Systems Manager validate the value is a valid AMI ID.
     * @default "text"
     */
    dataType?: "text" | "aws:ec2:image" | "aws:ssm:integration";
    /**
     * Tags to apply to the parameter. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Parameter extends Resource<"AWS.SSM.Parameter", ParameterProps, {
    parameterName: string;
    parameterArn: string;
    type: ParameterType;
    version: number;
    /**
     * The ARN of the KMS key that encrypts this parameter. Defined only for
     * `SecureString` parameters (resolved from `keyId`, defaulting to the
     * AWS-managed `alias/aws/ssm` key). Bindings use it to grant
     * `kms:Decrypt` for `WithDecryption` reads.
     */
    keyArn: string | undefined;
}, never, Providers> {
}
/**
 * An AWS Systems Manager (SSM) Parameter Store parameter.
 *
 * `Parameter` owns the lifecycle of a `String`, `StringList`, or
 * `SecureString` parameter. A parameter name is auto-generated from the app,
 * stage, and logical ID unless you provide one explicitly. Standard-tier
 * parameters are free, making them ideal for configuration values, feature
 * flags, and small secrets.
 * ### Creating Parameters
 * **Example:** String Parameter
 * ```typescript
 * import * as SSM from "alchemy/AWS/SSM";
 *
 * const config = yield* SSM.Parameter("DatabaseUrl", {
 *   value: "postgres://db.example.com:5432/app",
 * });
 * ```
 *
 * **Example:** StringList Parameter
 * ```typescript
 * const subnets = yield* SSM.Parameter("AllowedOrigins", {
 *   type: "StringList",
 *   value: "https://a.example.com,https://b.example.com",
 * });
 * ```
 *
 * **Example:** Parameter with a Hierarchical Name
 * ```typescript
 * const param = yield* SSM.Parameter("DbUrl", {
 *   name: "/my-app/prod/db-url",
 *   value: "postgres://db.example.com:5432/app",
 * });
 * ```
 *
 * ### SecureString Parameters
 * **Example:** Encrypted with the AWS-managed key
 * ```typescript
 * import * as Redacted from "effect/Redacted";
 *
 * const apiKey = yield* SSM.Parameter("ApiKey", {
 *   type: "SecureString",
 *   value: Redacted.make("super-secret-value"),
 * });
 * ```
 *
 * **Example:** Encrypted with a customer-managed KMS key
 * ```typescript
 * const key = yield* KMS.Key("SecretsKey");
 * const apiKey = yield* SSM.Parameter("ApiKey", {
 *   type: "SecureString",
 *   value: Redacted.make("super-secret-value"),
 *   keyId: key.keyId,
 * });
 * ```
 *
 * ### Validation
 * **Example:** Constrain values with an allowed pattern
 * ```typescript
 * const port = yield* SSM.Parameter("Port", {
 *   value: "5432",
 *   allowedPattern: "^\\d+$",
 * });
 * ```
 *
 * ### Reading Parameters at Runtime
 * Bind read operations in the init phase and use them in runtime handlers.
 *
 * **Example:** Read a parameter from a handler
 * ```typescript
 * // init
 * const getParameter = yield* SSM.GetParameter(config);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     const result = yield* getParameter({ WithDecryption: true });
 *     return HttpServerResponse.text(String(result.Parameter?.Value));
 *   }),
 * };
 * ```
 *
 * @resource
 */
export declare const Parameter: import("../../Resource.ts").ResourceClass<Parameter>;
export declare const ParameterProvider: () => import("effect/Layer").Layer<Provider.Provider<Parameter>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Parameter.d.ts.map