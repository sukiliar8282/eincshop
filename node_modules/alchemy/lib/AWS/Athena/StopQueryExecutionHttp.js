import * as athena from "@distilled.cloud/aws/athena";
import * as Layer from "effect/Layer";
import { makeWorkGroupScopedHttpBinding } from "./BindingHttp.js";
import { StopQueryExecution } from "./StopQueryExecution.js";
export const StopQueryExecutionHttp = Layer.effect(StopQueryExecution, makeWorkGroupScopedHttpBinding({
    tag: "AWS.Athena.StopQueryExecution",
    operation: athena.stopQueryExecution,
    actions: ["athena:StopQueryExecution"],
}));
//# sourceMappingURL=StopQueryExecutionHttp.js.map