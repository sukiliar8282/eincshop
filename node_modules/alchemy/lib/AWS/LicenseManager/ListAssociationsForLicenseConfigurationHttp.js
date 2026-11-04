import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseConfigurationHttpBinding } from "./BindingHttp.js";
import { ListAssociationsForLicenseConfiguration } from "./ListAssociationsForLicenseConfiguration.js";
export const ListAssociationsForLicenseConfigurationHttp = Layer.effect(ListAssociationsForLicenseConfiguration, makeLicenseConfigurationHttpBinding({
    capability: "ListAssociationsForLicenseConfiguration",
    iamActions: ["license-manager:ListAssociationsForLicenseConfiguration"],
    operation: licensemanager.listAssociationsForLicenseConfiguration,
}));
//# sourceMappingURL=ListAssociationsForLicenseConfigurationHttp.js.map