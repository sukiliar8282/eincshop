import * as mwaa from "@distilled.cloud/aws/mwaa-serverless";
import * as Layer from "effect/Layer";
import { makeMwaaServerlessHttpBinding } from "./BindingHttp.js";
import { StartWorkflowRun } from "./StartWorkflowRun.js";
export const StartWorkflowRunHttp = Layer.effect(StartWorkflowRun, makeMwaaServerlessHttpBinding({
    tag: "AWS.MWAAServerless.StartWorkflowRun",
    operation: mwaa.startWorkflowRun,
    actions: ["airflow-serverless:StartWorkflowRun"],
}));
//# sourceMappingURL=StartWorkflowRunHttp.js.map