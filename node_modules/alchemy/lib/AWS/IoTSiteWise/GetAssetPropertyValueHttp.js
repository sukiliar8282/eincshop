import * as sitewise from "@distilled.cloud/aws/iotsitewise";
import * as Layer from "effect/Layer";
import { makeSiteWiseAssetHttpBinding } from "./BindingHttp.js";
import { GetAssetPropertyValue, } from "./GetAssetPropertyValue.js";
export const GetAssetPropertyValueHttp = Layer.effect(GetAssetPropertyValue, makeSiteWiseAssetHttpBinding({
    capability: "GetAssetPropertyValue",
    iamActions: ["iotsitewise:GetAssetPropertyValue"],
    operation: sitewise.getAssetPropertyValue,
    prepare: (request, assetId) => ({
        ...request,
        assetId,
    }),
}));
//# sourceMappingURL=GetAssetPropertyValueHttp.js.map