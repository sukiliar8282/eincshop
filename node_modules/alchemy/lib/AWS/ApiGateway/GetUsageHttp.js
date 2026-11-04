import * as ag from "@distilled.cloud/aws/api-gateway";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { registerApiGatewayBinding } from "./BindingHttp.js";
import { GetUsage } from "./GetUsage.js";
/**
 * HTTP implementation of the {@link GetUsage} binding. Grants
 * `apigateway:GET` on the plan's `/usage` path and calls the API with the
 * host Function's credentials.
 */
export const GetUsageHttp = Layer.effect(GetUsage, Effect.gen(function* () {
    const getUsage = yield* ag.getUsage;
    return Effect.fn(function* (usagePlan) {
        const UsagePlanId = yield* usagePlan.id;
        yield* registerApiGatewayBinding({
            cap: "AWS.ApiGateway.GetUsage",
            target: usagePlan,
            verb: "GET",
            paths: (region) => [
                Output.interpolate `arn:aws:apigateway:${region}::/usageplans/${usagePlan.id}/usage`,
            ],
        });
        return Effect.fn(`AWS.ApiGateway.GetUsage(${usagePlan.LogicalId})`)(function* (request) {
            return yield* getUsage({
                ...request,
                usagePlanId: yield* UsagePlanId,
            });
        });
    });
}));
//# sourceMappingURL=GetUsageHttp.js.map