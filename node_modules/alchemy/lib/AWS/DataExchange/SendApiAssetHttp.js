import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeDataSetHttpBinding, dataSetAssetArns } from "./BindingHttp.js";
import { SendApiAsset } from "./SendApiAsset.js";
export const SendApiAssetHttp = Layer.effect(SendApiAsset, makeDataSetHttpBinding({
    tag: "AWS.DataExchange.SendApiAsset",
    operation: dataexchange.sendApiAsset,
    actions: ["dataexchange:SendApiAsset"],
    resources: dataSetAssetArns,
}));
//# sourceMappingURL=SendApiAssetHttp.js.map