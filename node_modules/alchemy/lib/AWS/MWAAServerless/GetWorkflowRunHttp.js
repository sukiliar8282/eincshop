import * as mwaa from "@distilled.cloud/aws/mwaa-serverless";
import * as Layer from "effect/Layer";
import { makeMwaaServerlessHttpBinding } from "./BindingHttp.js";
import { GetWorkflowRun } from "./GetWorkflowRun.js";
export const GetWorkflowRunHttp = Layer.effect(GetWorkflowRun, makeMwaaServerlessHttpBinding({
    tag: "AWS.MWAAServerless.GetWorkflowRun",
    operation: mwaa.getWorkflowRun,
    actions: ["airflow-serverless:GetWorkflowRun"],
}));
//# sourceMappingURL=GetWorkflowRunHttp.js.map