import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeRevisionHttpBinding, revisionAssetArns } from "./BindingHttp.js";
import { UpdateAsset } from "./UpdateAsset.js";
export const UpdateAssetHttp = Layer.effect(UpdateAsset, makeRevisionHttpBinding({
    tag: "AWS.DataExchange.UpdateAsset",
    operation: dataexchange.updateAsset,
    actions: ["dataexchange:UpdateAsset"],
    resources: revisionAssetArns,
}));
//# sourceMappingURL=UpdateAssetHttp.js.map