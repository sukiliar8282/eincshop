import * as aiops from "@distilled.cloud/aws/aiops";
import * as Layer from "effect/Layer";
import { makeAIOpsGroupHttpBinding } from "./BindingHttp.js";
import { ListTagsForResource } from "./ListTagsForResource.js";
export const ListTagsForResourceHttp = Layer.effect(ListTagsForResource, makeAIOpsGroupHttpBinding({
    tag: "AWS.AIOps.ListTagsForResource",
    operation: aiops.listTagsForResource,
    actions: ["aiops:ListTagsForResource"],
    input: (resourceArn) => ({ resourceArn }),
}));
//# sourceMappingURL=ListTagsForResourceHttp.js.map