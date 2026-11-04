import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Layer from "effect/Layer";
import { makeSESHttpBinding } from "./BindingHttp.js";
import { GetSuppressedDestination } from "./GetSuppressedDestination.js";
export const GetSuppressedDestinationHttp = Layer.effect(GetSuppressedDestination, makeSESHttpBinding({
    tag: "AWS.SES.GetSuppressedDestination",
    operation: sesv2.getSuppressedDestination,
    actions: ["ses:GetSuppressedDestination"],
}));
//# sourceMappingURL=GetSuppressedDestinationHttp.js.map