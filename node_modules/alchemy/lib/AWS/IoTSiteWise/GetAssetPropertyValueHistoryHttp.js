import * as sitewise from "@distilled.cloud/aws/iotsitewise";
import * as Layer from "effect/Layer";
import { makeSiteWiseAssetHttpBinding } from "./BindingHttp.js";
import { GetAssetPropertyValueHistory, } from "./GetAssetPropertyValueHistory.js";
export const GetAssetPropertyValueHistoryHttp = Layer.effect(GetAssetPropertyValueHistory, makeSiteWiseAssetHttpBinding({
    capability: "GetAssetPropertyValueHistory",
    iamActions: ["iotsitewise:GetAssetPropertyValueHistory"],
    operation: sitewise.getAssetPropertyValueHistory,
    prepare: (request, assetId) => ({
        ...request,
        assetId,
    }),
}));
//# sourceMappingURL=GetAssetPropertyValueHistoryHttp.js.map