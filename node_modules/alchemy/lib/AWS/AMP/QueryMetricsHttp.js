import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeAmpWorkspaceHttpBinding, toPromDuration, toPromTime, } from "./BindingHttp.js";
import { QueryMetrics, } from "./QueryMetrics.js";
export const QueryMetricsHttp = Layer.effect(QueryMetrics, makeAmpWorkspaceHttpBinding({
    name: "QueryMetrics",
    iamActions: ["aps:QueryMetrics"],
    makeClient: (send) => ({
        query: (request) => send({
            method: "POST",
            path: "api/v1/query",
            form: {
                query: request.query,
                time: request.time !== undefined ? toPromTime(request.time) : undefined,
                timeout: request.timeout !== undefined
                    ? toPromDuration(request.timeout)
                    : undefined,
            },
        }).pipe(Effect.map((data) => data)),
        queryRange: (request) => send({
            method: "POST",
            path: "api/v1/query_range",
            form: {
                query: request.query,
                start: toPromTime(request.start),
                end: toPromTime(request.end),
                step: toPromDuration(request.step),
                timeout: request.timeout !== undefined
                    ? toPromDuration(request.timeout)
                    : undefined,
            },
        }).pipe(Effect.map((data) => data)),
    }),
}));
//# sourceMappingURL=QueryMetricsHttp.js.map