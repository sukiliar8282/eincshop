import * as sdb from "@distilled.cloud/aws/simpledb";
import * as Layer from "effect/Layer";
import { makeSimpleDbBinding } from "./Binding.js";
import { PutAttributes } from "./PutAttributes.js";
export const PutAttributesHttp = Layer.effect(PutAttributes, makeSimpleDbBinding({
    operation: "PutAttributes",
    method: sdb.putAttributes,
}));
//# sourceMappingURL=PutAttributesHttp.js.map