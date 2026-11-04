import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { GetAsset } from "./GetAsset.js";
export const GetAssetHttp = Layer.effect(GetAsset, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.GetAsset",
    operation: datazone.getAsset,
    actions: ["datazone:GetAsset"],
}));
//# sourceMappingURL=GetAssetHttp.js.map