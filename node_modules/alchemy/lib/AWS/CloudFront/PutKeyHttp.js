import * as kvs from "@distilled.cloud/aws/cloudfront-keyvaluestore";
import * as Layer from "effect/Layer";
import { makeKeyValueStoreScopedHttpBinding } from "./BindingHttp.js";
import { PutKey } from "./PutKey.js";
export const PutKeyHttp = Layer.effect(PutKey, makeKeyValueStoreScopedHttpBinding({
    tag: "AWS.CloudFront.PutKey",
    operation: kvs.putKey,
    actions: ["cloudfront-keyvaluestore:PutKey"],
}));
//# sourceMappingURL=PutKeyHttp.js.map