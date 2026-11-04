import * as sitewise from "@distilled.cloud/aws/iotsitewise";
import * as Layer from "effect/Layer";
import { makeSiteWiseAssetHttpBinding } from "./BindingHttp.js";
import { GetAssetPropertyAggregates, } from "./GetAssetPropertyAggregates.js";
export const GetAssetPropertyAggregatesHttp = Layer.effect(GetAssetPropertyAggregates, makeSiteWiseAssetHttpBinding({
    capability: "GetAssetPropertyAggregates",
    iamActions: ["iotsitewise:GetAssetPropertyAggregates"],
    operation: sitewise.getAssetPropertyAggregates,
    prepare: (request, assetId) => ({
        ...request,
        assetId,
    }),
}));
//# sourceMappingURL=GetAssetPropertyAggregatesHttp.js.map