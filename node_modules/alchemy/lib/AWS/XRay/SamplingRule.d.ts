import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface SamplingRuleProps {
    /**
     * Name of the sampling rule (1-32 characters). `Default` is reserved by
     * X-Ray for the built-in fallback rule.
     *
     * Changing the name replaces the rule.
     * @default ${app}-${stage}-${id}
     */
    ruleName?: string;
    /**
     * The priority of the sampling rule. X-Ray evaluates rules in ascending
     * order of priority (`1` - `9999`) and applies the first rule that matches.
     */
    priority: number;
    /**
     * The percentage of matching requests to instrument, after the reservoir is
     * exhausted (`0.0` - `1.0`, e.g. `0.05` for 5%).
     */
    fixedRate: number;
    /**
     * A fixed number of matching requests to instrument per second, before
     * applying the fixed rate. The reservoir is not used directly by services,
     * but applies to all services using the rule collectively.
     * @default 0
     */
    reservoirSize?: number;
    /**
     * Matches the `name` that the service uses to identify itself in segments.
     * @default "*"
     */
    serviceName?: string;
    /**
     * Matches the `origin` that the service uses to identify its type in
     * segments (e.g. `AWS::Lambda::Function`).
     * @default "*"
     */
    serviceType?: string;
    /**
     * Matches the hostname from a request URL.
     * @default "*"
     */
    host?: string;
    /**
     * Matches the HTTP method of a request.
     * @default "*"
     */
    httpMethod?: string;
    /**
     * Matches the path from a request URL.
     * @default "*"
     */
    urlPath?: string;
    /**
     * Matches the ARN of the Amazon Web Services resource on which the service
     * runs.
     * @default "*"
     */
    resourceArn?: string;
    /**
     * Matches attributes derived from the request (segment annotations).
     */
    attributes?: Record<string, string>;
    /**
     * Tags to apply to the sampling rule. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface SamplingRule extends Resource<"AWS.XRay.SamplingRule", SamplingRuleProps, {
    /**
     * Name of the sampling rule.
     */
    ruleName: string;
    /**
     * ARN of the sampling rule
     * (`arn:aws:xray:{region}:{account}:sampling-rule/{name}`).
     */
    ruleArn: string;
}, never, Providers> {
}
/**
 * An AWS X-Ray sampling rule that controls which requests are recorded as
 * traces by instrumented applications.
 *
 * X-Ray evaluates sampling rules in ascending priority order for each
 * request. The first matching rule borrows from its reservoir, then applies
 * the fixed rate.
 * ### Creating Sampling Rules
 * **Example:** Sample all requests to a service
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * const rule = yield* XRay.SamplingRule("SampleEverything", {
 *   priority: 100,
 *   fixedRate: 1.0,
 *   reservoirSize: 5,
 *   serviceName: "my-api-*",
 * });
 * ```
 *
 * **Example:** Low-rate sampling for a noisy endpoint
 * ```typescript
 * const rule = yield* XRay.SamplingRule("HealthChecks", {
 *   priority: 10,
 *   fixedRate: 0.01,
 *   urlPath: "/health",
 *   httpMethod: "GET",
 * });
 * ```
 *
 * **Example:** Match on segment attributes
 * ```typescript
 * const rule = yield* XRay.SamplingRule("PremiumTenants", {
 *   priority: 50,
 *   fixedRate: 0.5,
 *   reservoirSize: 1,
 *   attributes: { tier: "premium" },
 * });
 * ```
 *
 * @resource
 */
export declare const SamplingRule: import("../../Resource.ts").ResourceClass<SamplingRule>;
declare const XRayReservedRuleName_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "XRayReservedRuleName";
} & Readonly<A>;
/**
 * Raised when a `SamplingRule` is configured with the reserved rule name
 * `Default`, which X-Ray uses for the built-in fallback rule.
 */
export declare class XRayReservedRuleName extends XRayReservedRuleName_base<{
    message: string;
}> {
}
export declare const SamplingRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<SamplingRule>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=SamplingRule.d.ts.map