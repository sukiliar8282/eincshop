import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsAccountHttpBinding } from "./BindingHttp.js";
import { ListSubscriptions } from "./ListSubscriptions.js";
export const ListSubscriptionsHttp = Layer.effect(ListSubscriptions, makeSnsAccountHttpBinding({
    tag: "AWS.SNS.ListSubscriptions",
    operation: sns.listSubscriptions,
    actions: ["sns:ListSubscriptions"],
}));
//# sourceMappingURL=ListSubscriptionsHttp.js.map