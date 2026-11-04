import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeAmpWorkspaceHttpBinding, toPromTime } from "./BindingHttp.js";
import { GetLabels, } from "./GetLabels.js";
const rangeParams = (request) => ({
    "match[]": request.match,
    start: request.start !== undefined ? toPromTime(request.start) : undefined,
    end: request.end !== undefined ? toPromTime(request.end) : undefined,
});
export const GetLabelsHttp = Layer.effect(GetLabels, makeAmpWorkspaceHttpBinding({
    name: "GetLabels",
    iamActions: ["aps:GetLabels"],
    makeClient: (send) => ({
        labelNames: (request = {}) => send({
            method: "GET",
            path: "api/v1/labels",
            query: rangeParams(request),
        }).pipe(Effect.map((data) => data)),
        labelValues: (request) => send({
            method: "GET",
            path: `api/v1/label/${encodeURIComponent(request.label)}/values`,
            query: rangeParams(request),
        }).pipe(Effect.map((data) => data)),
    }),
}));
//# sourceMappingURL=GetLabelsHttp.js.map