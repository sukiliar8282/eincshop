import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseConfigurationHttpBinding } from "./BindingHttp.js";
import { GetLicenseConfiguration } from "./GetLicenseConfiguration.js";
export const GetLicenseConfigurationHttp = Layer.effect(GetLicenseConfiguration, makeLicenseConfigurationHttpBinding({
    capability: "GetLicenseConfiguration",
    iamActions: ["license-manager:GetLicenseConfiguration"],
    operation: licensemanager.getLicenseConfiguration,
}));
//# sourceMappingURL=GetLicenseConfigurationHttp.js.map