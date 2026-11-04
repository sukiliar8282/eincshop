import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseManagerHttpBinding } from "./BindingHttp.js";
import { ListLicenseVersions } from "./ListLicenseVersions.js";
export const ListLicenseVersionsHttp = Layer.effect(ListLicenseVersions, makeLicenseManagerHttpBinding({
    capability: "ListLicenseVersions",
    iamActions: ["license-manager:ListLicenseVersions"],
    operation: licensemanager.listLicenseVersions,
}));
//# sourceMappingURL=ListLicenseVersionsHttp.js.map