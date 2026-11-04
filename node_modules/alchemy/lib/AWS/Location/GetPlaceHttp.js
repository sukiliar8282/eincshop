import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationPlaceIndexHttpBinding } from "./BindingHttp.js";
import { GetPlace } from "./GetPlace.js";
export const GetPlaceHttp = Layer.effect(GetPlace, makeLocationPlaceIndexHttpBinding({
    tag: "AWS.Location.GetPlace",
    operation: location.getPlace,
    actions: ["geo:GetPlace"],
}));
//# sourceMappingURL=GetPlaceHttp.js.map