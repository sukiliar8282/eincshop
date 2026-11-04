import * as sqs from "@distilled.cloud/aws/sqs";
import * as Layer from "effect/Layer";
import { makeQueueArnHttpBinding } from "./BindingHttp.js";
import { ListMessageMoveTasks } from "./ListMessageMoveTasks.js";
export const ListMessageMoveTasksHttp = Layer.effect(ListMessageMoveTasks, makeQueueArnHttpBinding({
    tag: "AWS.SQS.ListMessageMoveTasks",
    operation: sqs.listMessageMoveTasks,
    actions: ["sqs:ListMessageMoveTasks"],
}));
//# sourceMappingURL=ListMessageMoveTasksHttp.js.map