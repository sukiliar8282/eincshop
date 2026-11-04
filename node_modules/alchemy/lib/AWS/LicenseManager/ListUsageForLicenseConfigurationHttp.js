import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseConfigurationHttpBinding } from "./BindingHttp.js";
import { ListUsageForLicenseConfiguration } from "./ListUsageForLicenseConfiguration.js";
export const ListUsageForLicenseConfigurationHttp = Layer.effect(ListUsageForLicenseConfiguration, makeLicenseConfigurationHttpBinding({
    capability: "ListUsageForLicenseConfiguration",
    iamActions: ["license-manager:ListUsageForLicenseConfiguration"],
    operation: licensemanager.listUsageForLicenseConfiguration,
}));
//# sourceMappingURL=ListUsageForLicenseConfigurationHttp.js.map