import * as Lambda from "@distilled.cloud/aws/lambda";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import { type EventInvokeConfig } from "./EventInvokeConfig.ts";
import type { Version } from "./Version.ts";
export interface AliasProps {
    /**
     * Managed Lambda version that this alias invokes.
     */
    version: Version;
    /**
     * Name of the alias. If omitted, a unique name is generated.
     */
    aliasName?: string;
    /**
     * Description of the alias.
     */
    description?: string;
    /**
     * Weighted routing configuration for shifting traffic to an additional
     * function version.
     */
    routingConfig?: Lambda.AliasRoutingConfiguration;
    /**
     * Asynchronous invocation settings (retries, event age, destinations)
     * scoped to this alias. Omit to remove any existing alias-level config and
     * fall back to Lambda's defaults (2 retries, 6-hour max event age, no
     * destinations).
     */
    eventInvokeConfig?: EventInvokeConfig;
}
export interface Alias extends Resource<"AWS.Lambda.Alias", AliasProps, {
    /**
     * ARN of the Lambda alias.
     */
    aliasArn: string;
    /**
     * Name of the alias.
     */
    aliasName: string;
    /**
     * Name or ARN of the Lambda function this alias belongs to.
     */
    functionName: string;
    /**
     * Lambda function version that this alias invokes.
     */
    functionVersion: string;
    /**
     * API Gateway-compatible invocation ARN for this alias.
     */
    invokeArn: string;
    /**
     * Description of the alias.
     */
    description?: string;
    /**
     * Weighted routing configuration for this alias.
     */
    routingConfig?: Lambda.AliasRoutingConfiguration;
    /**
     * Latest Lambda revision id for this alias.
     */
    revisionId?: string;
}, never, Providers> {
}
/**
 * A Lambda alias for routing invocations to a stable function version.
 *
 * ### Creating Aliases
 * **Example:** Production Alias
 * ```typescript
 * const version = yield* Version("ProductionVersion", { function: fn });
 * const alias = yield* Alias("ProductionAlias", {
 *   version,
 *   aliasName: "production",
 * });
 * ```
 *
 * ### Weighted Routing
 * **Example:** Shift Traffic to Another Version
 * ```typescript
 * const version = yield* Version("LiveVersion", { function: fn });
 * const alias = yield* Alias("LiveAlias", {
 *   version,
 *   aliasName: "live",
 *   routingConfig: {
 *     AdditionalVersionWeights: {
 *       "3": 0.1,
 *     },
 *   },
 * });
 * ```
 *
 * ### Async Invocation
 * **Example:** Alias-Scoped Retry Behavior
 * ```typescript
 * const version = yield* Version("LiveVersion", { function: fn });
 * const alias = yield* Alias("LiveAlias", {
 *   version,
 *   aliasName: "live",
 *   eventInvokeConfig: {
 *     maximumRetryAttempts: 0,
 *     destinationConfig: {
 *       OnFailure: {
 *         Destination: queue.queueArn,
 *       },
 *     },
 *   },
 * });
 * ```
 */
export declare const Alias: import("../../Resource.ts").ResourceClass<Alias>;
export declare const AliasProvider: () => import("effect/Layer").Layer<Provider.Provider<Alias>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Alias.d.ts.map