import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeAmpWorkspaceHttpBinding, toPromTime } from "./BindingHttp.js";
import { GetSeries } from "./GetSeries.js";
export const GetSeriesHttp = Layer.effect(GetSeries, makeAmpWorkspaceHttpBinding({
    name: "GetSeries",
    iamActions: ["aps:GetSeries"],
    makeClient: (send) => (request) => send({
        method: "GET",
        path: "api/v1/series",
        query: {
            "match[]": request.match,
            start: request.start !== undefined ? toPromTime(request.start) : undefined,
            end: request.end !== undefined ? toPromTime(request.end) : undefined,
        },
    }).pipe(Effect.map((data) => data)),
}));
//# sourceMappingURL=GetSeriesHttp.js.map