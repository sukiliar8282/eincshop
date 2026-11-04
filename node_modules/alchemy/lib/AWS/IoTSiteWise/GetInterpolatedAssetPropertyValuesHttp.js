import * as sitewise from "@distilled.cloud/aws/iotsitewise";
import * as Layer from "effect/Layer";
import { makeSiteWiseAssetHttpBinding } from "./BindingHttp.js";
import { GetInterpolatedAssetPropertyValues, } from "./GetInterpolatedAssetPropertyValues.js";
export const GetInterpolatedAssetPropertyValuesHttp = Layer.effect(GetInterpolatedAssetPropertyValues, makeSiteWiseAssetHttpBinding({
    capability: "GetInterpolatedAssetPropertyValues",
    iamActions: ["iotsitewise:GetInterpolatedAssetPropertyValues"],
    operation: sitewise.getInterpolatedAssetPropertyValues,
    prepare: (request, assetId) => ({
        ...request,
        assetId,
    }),
}));
//# sourceMappingURL=GetInterpolatedAssetPropertyValuesHttp.js.map