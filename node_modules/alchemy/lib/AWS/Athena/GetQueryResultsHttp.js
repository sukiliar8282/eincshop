import * as athena from "@distilled.cloud/aws/athena";
import * as Layer from "effect/Layer";
import { makeWorkGroupScopedHttpBinding } from "./BindingHttp.js";
import { GetQueryResults } from "./GetQueryResults.js";
export const GetQueryResultsHttp = Layer.effect(GetQueryResults, makeWorkGroupScopedHttpBinding({
    tag: "AWS.Athena.GetQueryResults",
    operation: athena.getQueryResults,
    actions: ["athena:GetQueryResults"],
}));
//# sourceMappingURL=GetQueryResultsHttp.js.map