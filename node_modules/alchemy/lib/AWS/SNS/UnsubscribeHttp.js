import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsAccountHttpBinding } from "./BindingHttp.js";
import { Unsubscribe } from "./Unsubscribe.js";
export const UnsubscribeHttp = Layer.effect(Unsubscribe, makeSnsAccountHttpBinding({
    tag: "AWS.SNS.Unsubscribe",
    operation: sns.unsubscribe,
    actions: ["sns:Unsubscribe"],
}));
//# sourceMappingURL=UnsubscribeHttp.js.map