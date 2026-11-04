import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { GetOnClusterAppUIPresignedURL } from "./GetOnClusterAppUIPresignedURL.js";
export const GetOnClusterAppUIPresignedURLHttp = Layer.effect(GetOnClusterAppUIPresignedURL, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.GetOnClusterAppUIPresignedURL",
    operation: emr.getOnClusterAppUIPresignedURL,
    actions: ["elasticmapreduce:GetOnClusterAppUIPresignedURL"],
}));
//# sourceMappingURL=GetOnClusterAppUIPresignedURLHttp.js.map