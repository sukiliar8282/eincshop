import * as kvs from "@distilled.cloud/aws/cloudfront-keyvaluestore";
import * as Layer from "effect/Layer";
import { makeKeyValueStoreScopedHttpBinding } from "./BindingHttp.js";
import { GetKey } from "./GetKey.js";
export const GetKeyHttp = Layer.effect(GetKey, makeKeyValueStoreScopedHttpBinding({
    tag: "AWS.CloudFront.GetKey",
    operation: kvs.getKey,
    actions: ["cloudfront-keyvaluestore:GetKey"],
}));
//# sourceMappingURL=GetKeyHttp.js.map