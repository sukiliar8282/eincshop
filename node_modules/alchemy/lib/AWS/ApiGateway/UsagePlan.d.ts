import * as ag from "@distilled.cloud/aws/api-gateway";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { AWSEnvironment } from "../Environment.ts";
export interface UsagePlanProps {
    /**
     * Friendly name for the usage plan.
     *
     * If omitted, Alchemy generates a deterministic physical name.
     */
    name?: string;
    /**
     * Human-readable description for operators.
     */
    description?: string;
    /**
     * API stages associated with this plan.
     */
    apiStages?: ag.ApiStage[];
    /**
     * Default request throttle applied by the plan.
     */
    throttle?: ag.ThrottleSettings;
    /**
     * Quota limit and period applied by the plan.
     */
    quota?: ag.QuotaSettings;
    /**
     * User-defined tags. Alchemy internal tags are merged automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface UsagePlan extends Resource<"AWS.ApiGateway.UsagePlan", UsagePlanProps, {
    id: string;
    name: string | undefined;
    description: string | undefined;
    apiStages: ag.ApiStage[] | undefined;
    throttle: ag.ThrottleSettings | undefined;
    quota: ag.QuotaSettings | undefined;
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * Usage plan for API stages, throttling, and quotas.
 *
 * ### Usage plans
 * **Example:** Usage plan with stage
 * ```typescript
 * const plan = yield* ApiGateway.UsagePlan("Standard", {
 *   apiStages: [{ apiId: api.restApiId, stage: stage.stageName }],
 * });
 * ```
 *
 * **Example:** Throttled plan with a quota and an enrolled API key
 * ```typescript
 * const plan = yield* ApiGateway.UsagePlan("Partner", {
 *   throttle: { rateLimit: 10, burstLimit: 20 },
 *   quota: { limit: 10_000, period: "MONTH" },
 * });
 *
 * const key = yield* ApiGateway.ApiKey("PartnerKey", {
 *   generateDistinctId: true,
 * });
 *
 * yield* ApiGateway.UsagePlanKey("PartnerLink", {
 *   usagePlanId: plan.id,
 *   keyId: key.id,
 * });
 * ```
 */
declare const UsagePlanResource: import("../../Resource.ts").ResourceClass<UsagePlan>;
export { UsagePlanResource as UsagePlan };
export declare const UsagePlanProvider: () => import("effect/Layer").Layer<Provider.Provider<UsagePlan>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=UsagePlan.d.ts.map