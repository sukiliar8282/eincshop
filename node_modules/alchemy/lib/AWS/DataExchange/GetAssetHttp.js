import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeRevisionHttpBinding, revisionAssetArns } from "./BindingHttp.js";
import { GetAsset } from "./GetAsset.js";
export const GetAssetHttp = Layer.effect(GetAsset, makeRevisionHttpBinding({
    tag: "AWS.DataExchange.GetAsset",
    operation: dataexchange.getAsset,
    actions: ["dataexchange:GetAsset"],
    resources: revisionAssetArns,
}));
//# sourceMappingURL=GetAssetHttp.js.map