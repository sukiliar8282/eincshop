import * as mwaa from "@distilled.cloud/aws/mwaa-serverless";
import * as Layer from "effect/Layer";
import { makeMwaaServerlessHttpBinding } from "./BindingHttp.js";
import { StopWorkflowRun } from "./StopWorkflowRun.js";
export const StopWorkflowRunHttp = Layer.effect(StopWorkflowRun, makeMwaaServerlessHttpBinding({
    tag: "AWS.MWAAServerless.StopWorkflowRun",
    operation: mwaa.stopWorkflowRun,
    actions: ["airflow-serverless:StopWorkflowRun"],
}));
//# sourceMappingURL=StopWorkflowRunHttp.js.map