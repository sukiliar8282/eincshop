import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeAmpWorkspaceHttpBinding } from "./BindingHttp.js";
import { GetMetricMetadata, } from "./GetMetricMetadata.js";
export const GetMetricMetadataHttp = Layer.effect(GetMetricMetadata, makeAmpWorkspaceHttpBinding({
    name: "GetMetricMetadata",
    iamActions: ["aps:GetMetricMetadata"],
    makeClient: (send) => (request) => send({
        method: "GET",
        path: "api/v1/metadata",
        query: {
            metric: request.metric,
            limit: request.limit !== undefined ? String(request.limit) : undefined,
        },
    }).pipe(Effect.map((data) => data)),
}));
//# sourceMappingURL=GetMetricMetadataHttp.js.map