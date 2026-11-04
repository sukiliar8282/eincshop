import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Layer from "effect/Layer";
import { makeInspector2AccountHttpBinding } from "./BindingHttp.js";
import { GetClustersForImage } from "./GetClustersForImage.js";
export const GetClustersForImageHttp = Layer.effect(GetClustersForImage, makeInspector2AccountHttpBinding({
    tag: "AWS.Inspector2.GetClustersForImage",
    operation: inspector2.getClustersForImage,
    actions: ["inspector2:GetClustersForImage"],
}));
//# sourceMappingURL=GetClustersForImageHttp.js.map