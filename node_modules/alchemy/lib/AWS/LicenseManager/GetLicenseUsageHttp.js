import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseManagerHttpBinding } from "./BindingHttp.js";
import { GetLicenseUsage } from "./GetLicenseUsage.js";
export const GetLicenseUsageHttp = Layer.effect(GetLicenseUsage, makeLicenseManagerHttpBinding({
    capability: "GetLicenseUsage",
    iamActions: ["license-manager:GetLicenseUsage"],
    operation: licensemanager.getLicenseUsage,
}));
//# sourceMappingURL=GetLicenseUsageHttp.js.map