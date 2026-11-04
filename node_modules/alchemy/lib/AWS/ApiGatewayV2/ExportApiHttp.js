import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { registerApiGatewayV2Binding } from "./BindingHttp.js";
import { ExportApi } from "./ExportApi.js";
/**
 * HTTP implementation of the {@link ExportApi} binding. Grants
 * `apigateway:GET` on the API's `/exports/*` path and calls the API with
 * the host Function's credentials.
 */
export const ExportApiHttp = Layer.effect(ExportApi, Effect.gen(function* () {
    const exportApi = yield* agw2.exportApi;
    return Effect.fn(function* (api) {
        const ApiId = yield* api.apiId;
        yield* registerApiGatewayV2Binding({
            cap: "AWS.ApiGatewayV2.ExportApi",
            target: api,
            verb: "GET",
            paths: (region) => [
                Output.interpolate `arn:aws:apigateway:${region}::/apis/${api.apiId}/exports/*`,
            ],
        });
        return Effect.fn(`AWS.ApiGatewayV2.ExportApi(${api.LogicalId})`)(function* (request) {
            return yield* exportApi({
                ...request,
                ApiId: yield* ApiId,
                Specification: request?.Specification ?? "OAS30",
            });
        });
    });
}));
//# sourceMappingURL=ExportApiHttp.js.map