import * as sitewise from "@distilled.cloud/aws/iotsitewise";
import * as Layer from "effect/Layer";
import { makeSiteWiseAssetHttpBinding } from "./BindingHttp.js";
import { ListAssetProperties, } from "./ListAssetProperties.js";
export const ListAssetPropertiesHttp = Layer.effect(ListAssetProperties, makeSiteWiseAssetHttpBinding({
    capability: "ListAssetProperties",
    iamActions: ["iotsitewise:ListAssetProperties"],
    operation: sitewise.listAssetProperties,
    prepare: (request, assetId) => ({
        ...request,
        assetId,
    }),
}));
//# sourceMappingURL=ListAssetPropertiesHttp.js.map