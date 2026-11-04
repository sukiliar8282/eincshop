import * as codedeploy from "@distilled.cloud/aws/codedeploy";
import * as Layer from "effect/Layer";
import { makeCodeDeployGroupHttpBinding } from "./BindingHttp.js";
import { PutLifecycleEventHookExecutionStatus } from "./PutLifecycleEventHookExecutionStatus.js";
export const PutLifecycleEventHookExecutionStatusHttp = Layer.effect(PutLifecycleEventHookExecutionStatus, makeCodeDeployGroupHttpBinding({
    tag: "AWS.CodeDeploy.PutLifecycleEventHookExecutionStatus",
    operation: codedeploy.putLifecycleEventHookExecutionStatus,
    actions: ["codedeploy:PutLifecycleEventHookExecutionStatus"],
}));
//# sourceMappingURL=PutLifecycleEventHookExecutionStatusHttp.js.map