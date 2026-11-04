import * as personalizeevents from "@distilled.cloud/aws/personalize-events";
import * as Layer from "effect/Layer";
import { makePersonalizeDatasetHttpBinding } from "./BindingHttp.js";
import { PutItems } from "./PutItems.js";
export const PutItemsHttp = Layer.effect(PutItems, makePersonalizeDatasetHttpBinding({
    tag: "AWS.Personalize.PutItems",
    operation: personalizeevents.putItems,
    actions: ["personalize:PutItems"],
}));
//# sourceMappingURL=PutItemsHttp.js.map