import * as ag from "@distilled.cloud/aws/api-gateway";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { registerApiGatewayBinding } from "./BindingHttp.js";
import { UpdateUsage } from "./UpdateUsage.js";
/**
 * HTTP implementation of the {@link UpdateUsage} binding. Grants
 * `apigateway:PATCH` on the plan's per-key `/usage` paths and calls the
 * API with the host Function's credentials.
 */
export const UpdateUsageHttp = Layer.effect(UpdateUsage, Effect.gen(function* () {
    const updateUsage = yield* ag.updateUsage;
    return Effect.fn(function* (usagePlan) {
        const UsagePlanId = yield* usagePlan.id;
        yield* registerApiGatewayBinding({
            cap: "AWS.ApiGateway.UpdateUsage",
            target: usagePlan,
            verb: "PATCH",
            paths: (region) => [
                Output.interpolate `arn:aws:apigateway:${region}::/usageplans/${usagePlan.id}/keys/*/usage`,
            ],
        });
        return Effect.fn(`AWS.ApiGateway.UpdateUsage(${usagePlan.LogicalId})`)(function* (request) {
            return yield* updateUsage({
                ...request,
                usagePlanId: yield* UsagePlanId,
            });
        });
    });
}));
//# sourceMappingURL=UpdateUsageHttp.js.map