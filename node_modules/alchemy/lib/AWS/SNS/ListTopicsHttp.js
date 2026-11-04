import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsAccountHttpBinding } from "./BindingHttp.js";
import { ListTopics } from "./ListTopics.js";
export const ListTopicsHttp = Layer.effect(ListTopics, makeSnsAccountHttpBinding({
    tag: "AWS.SNS.ListTopics",
    operation: sns.listTopics,
    actions: ["sns:ListTopics"],
}));
//# sourceMappingURL=ListTopicsHttp.js.map