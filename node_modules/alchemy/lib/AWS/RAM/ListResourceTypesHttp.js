import * as ram from "@distilled.cloud/aws/ram";
import * as Layer from "effect/Layer";
import { makeRAMHttpBinding } from "./BindingHttp.js";
import { ListResourceTypes } from "./ListResourceTypes.js";
export const ListResourceTypesHttp = Layer.effect(ListResourceTypes, makeRAMHttpBinding({
    capability: "ListResourceTypes",
    iamActions: ["ram:ListResourceTypes"],
    operation: ram.listResourceTypes,
}));
//# sourceMappingURL=ListResourceTypesHttp.js.map