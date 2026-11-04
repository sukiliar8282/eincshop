import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { GetPersistentAppUIPresignedURL } from "./GetPersistentAppUIPresignedURL.js";
export const GetPersistentAppUIPresignedURLHttp = Layer.effect(GetPersistentAppUIPresignedURL, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.GetPersistentAppUIPresignedURL",
    operation: emr.getPersistentAppUIPresignedURL,
    actions: ["elasticmapreduce:GetPersistentAppUIPresignedURL"],
    inject: "none",
}));
//# sourceMappingURL=GetPersistentAppUIPresignedURLHttp.js.map