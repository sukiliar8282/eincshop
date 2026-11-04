import * as kvs from "@distilled.cloud/aws/cloudfront-keyvaluestore";
import * as Layer from "effect/Layer";
import { makeKeyValueStoreScopedHttpBinding } from "./BindingHttp.js";
import { UpdateKeys } from "./UpdateKeys.js";
export const UpdateKeysHttp = Layer.effect(UpdateKeys, makeKeyValueStoreScopedHttpBinding({
    tag: "AWS.CloudFront.UpdateKeys",
    operation: kvs.updateKeys,
    actions: ["cloudfront-keyvaluestore:UpdateKeys"],
}));
//# sourceMappingURL=UpdateKeysHttp.js.map