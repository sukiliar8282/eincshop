import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { registerApiGatewayV2Binding } from "./BindingHttp.js";
import { ResetAuthorizersCache } from "./ResetAuthorizersCache.js";
/**
 * HTTP implementation of the {@link ResetAuthorizersCache} binding.
 * Grants `apigateway:DELETE` on the stage's `/cache/authorizers` path and
 * calls the API with the host Function's credentials.
 */
export const ResetAuthorizersCacheHttp = Layer.effect(ResetAuthorizersCache, Effect.gen(function* () {
    const resetAuthorizersCache = yield* agw2.resetAuthorizersCache;
    return Effect.fn(function* (stage) {
        const ApiId = yield* stage.apiId;
        const StageName = yield* stage.stageName;
        yield* registerApiGatewayV2Binding({
            cap: "AWS.ApiGatewayV2.ResetAuthorizersCache",
            target: stage,
            verb: "DELETE",
            paths: (region) => [
                Output.interpolate `arn:aws:apigateway:${region}::/apis/${stage.apiId}/stages/${stage.stageName}/cache/authorizers`,
            ],
        });
        return Effect.fn(`AWS.ApiGatewayV2.ResetAuthorizersCache(${stage.LogicalId})`)(function* () {
            return yield* resetAuthorizersCache({
                ApiId: yield* ApiId,
                StageName: yield* StageName,
            });
        });
    });
}));
//# sourceMappingURL=ResetAuthorizersCacheHttp.js.map