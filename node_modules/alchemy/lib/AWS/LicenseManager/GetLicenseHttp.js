import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseManagerHttpBinding } from "./BindingHttp.js";
import { GetLicense } from "./GetLicense.js";
export const GetLicenseHttp = Layer.effect(GetLicense, makeLicenseManagerHttpBinding({
    capability: "GetLicense",
    iamActions: ["license-manager:GetLicense"],
    operation: licensemanager.getLicense,
}));
//# sourceMappingURL=GetLicenseHttp.js.map