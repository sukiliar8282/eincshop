import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseManagerHttpBinding } from "./BindingHttp.js";
import { GetGrant } from "./GetGrant.js";
export const GetGrantHttp = Layer.effect(GetGrant, makeLicenseManagerHttpBinding({
    capability: "GetGrant",
    iamActions: ["license-manager:GetGrant"],
    operation: licensemanager.getGrant,
}));
//# sourceMappingURL=GetGrantHttp.js.map