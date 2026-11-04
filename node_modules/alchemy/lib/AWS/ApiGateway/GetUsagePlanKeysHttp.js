import * as ag from "@distilled.cloud/aws/api-gateway";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { registerApiGatewayBinding } from "./BindingHttp.js";
import { GetUsagePlanKeys, } from "./GetUsagePlanKeys.js";
/**
 * HTTP implementation of the {@link GetUsagePlanKeys} binding. Grants
 * `apigateway:GET` on the plan's `/keys` path and calls the API with the
 * host Function's credentials.
 */
export const GetUsagePlanKeysHttp = Layer.effect(GetUsagePlanKeys, Effect.gen(function* () {
    const getUsagePlanKeys = yield* ag.getUsagePlanKeys;
    return Effect.fn(function* (usagePlan) {
        const UsagePlanId = yield* usagePlan.id;
        yield* registerApiGatewayBinding({
            cap: "AWS.ApiGateway.GetUsagePlanKeys",
            target: usagePlan,
            verb: "GET",
            paths: (region) => [
                Output.interpolate `arn:aws:apigateway:${region}::/usageplans/${usagePlan.id}/keys`,
            ],
        });
        return Effect.fn(`AWS.ApiGateway.GetUsagePlanKeys(${usagePlan.LogicalId})`)(function* (request) {
            return yield* getUsagePlanKeys({
                ...request,
                usagePlanId: yield* UsagePlanId,
            });
        });
    });
}));
//# sourceMappingURL=GetUsagePlanKeysHttp.js.map