import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { StartRun } from "./StartRun.js";
export const StartRunHttp = Layer.effect(StartRun, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.StartRun",
    operation: omics.startRun,
    actions: ["omics:StartRun"],
    key: "workflowId",
    id: (workflow) => workflow.workflowId,
    arn: (workflow) => workflow.workflowArn,
    passRole: true,
}));
//# sourceMappingURL=StartRunHttp.js.map