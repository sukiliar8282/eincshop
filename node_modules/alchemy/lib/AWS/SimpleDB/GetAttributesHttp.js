import * as sdb from "@distilled.cloud/aws/simpledb";
import * as Layer from "effect/Layer";
import { makeSimpleDbBinding } from "./Binding.js";
import { GetAttributes } from "./GetAttributes.js";
export const GetAttributesHttp = Layer.effect(GetAttributes, makeSimpleDbBinding({
    operation: "GetAttributes",
    method: sdb.getAttributes,
}));
//# sourceMappingURL=GetAttributesHttp.js.map