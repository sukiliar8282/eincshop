import * as mwaa from "@distilled.cloud/aws/mwaa-serverless";
import * as Layer from "effect/Layer";
import { makeMwaaServerlessHttpBinding } from "./BindingHttp.js";
import { ListWorkflowRuns } from "./ListWorkflowRuns.js";
export const ListWorkflowRunsHttp = Layer.effect(ListWorkflowRuns, makeMwaaServerlessHttpBinding({
    tag: "AWS.MWAAServerless.ListWorkflowRuns",
    operation: mwaa.listWorkflowRuns,
    actions: ["airflow-serverless:ListWorkflowRuns"],
}));
//# sourceMappingURL=ListWorkflowRunsHttp.js.map