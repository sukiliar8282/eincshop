import * as athena from "@distilled.cloud/aws/athena";
import * as Layer from "effect/Layer";
import { makeWorkGroupScopedHttpBinding } from "./BindingHttp.js";
import { GetQueryExecution } from "./GetQueryExecution.js";
export const GetQueryExecutionHttp = Layer.effect(GetQueryExecution, makeWorkGroupScopedHttpBinding({
    tag: "AWS.Athena.GetQueryExecution",
    operation: athena.getQueryExecution,
    actions: ["athena:GetQueryExecution"],
}));
//# sourceMappingURL=GetQueryExecutionHttp.js.map