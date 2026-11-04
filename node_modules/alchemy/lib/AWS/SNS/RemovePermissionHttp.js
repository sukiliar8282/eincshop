import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsTopicHttpBinding } from "./BindingHttp.js";
import { RemovePermission } from "./RemovePermission.js";
export const RemovePermissionHttp = Layer.effect(RemovePermission, makeSnsTopicHttpBinding({
    tag: "AWS.SNS.RemovePermission",
    operation: sns.removePermission,
    actions: ["sns:RemovePermission"],
    key: "TopicArn",
}));
//# sourceMappingURL=RemovePermissionHttp.js.map