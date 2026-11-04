import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessApplicationHttpBinding } from "./BindingHttp.js";
import { GetMedia } from "./GetMedia.js";
export const GetMediaHttp = Layer.effect(GetMedia, makeQBusinessApplicationHttpBinding({
    tag: "AWS.QBusiness.GetMedia",
    operation: qbusiness.getMedia,
    actions: ["qbusiness:GetMedia"],
}));
//# sourceMappingURL=GetMediaHttp.js.map