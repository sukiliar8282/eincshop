import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseManagerHttpBinding } from "./BindingHttp.js";
import { GetAccessToken } from "./GetAccessToken.js";
export const GetAccessTokenHttp = Layer.effect(GetAccessToken, makeLicenseManagerHttpBinding({
    capability: "GetAccessToken",
    iamActions: ["license-manager:GetAccessToken"],
    operation: licensemanager.getAccessToken,
}));
//# sourceMappingURL=GetAccessTokenHttp.js.map