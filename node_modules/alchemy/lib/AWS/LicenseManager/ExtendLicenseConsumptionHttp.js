import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseManagerHttpBinding } from "./BindingHttp.js";
import { ExtendLicenseConsumption } from "./ExtendLicenseConsumption.js";
export const ExtendLicenseConsumptionHttp = Layer.effect(ExtendLicenseConsumption, makeLicenseManagerHttpBinding({
    capability: "ExtendLicenseConsumption",
    iamActions: ["license-manager:ExtendLicenseConsumption"],
    operation: licensemanager.extendLicenseConsumption,
}));
//# sourceMappingURL=ExtendLicenseConsumptionHttp.js.map