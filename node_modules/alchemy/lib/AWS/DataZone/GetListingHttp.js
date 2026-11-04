import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { GetListing } from "./GetListing.js";
export const GetListingHttp = Layer.effect(GetListing, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.GetListing",
    operation: datazone.getListing,
    actions: ["datazone:GetListing"],
}));
//# sourceMappingURL=GetListingHttp.js.map