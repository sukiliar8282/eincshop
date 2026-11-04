import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseManagerHttpBinding } from "./BindingHttp.js";
import { ListReceivedLicenses } from "./ListReceivedLicenses.js";
export const ListReceivedLicensesHttp = Layer.effect(ListReceivedLicenses, makeLicenseManagerHttpBinding({
    capability: "ListReceivedLicenses",
    iamActions: ["license-manager:ListReceivedLicenses"],
    operation: licensemanager.listReceivedLicenses,
}));
//# sourceMappingURL=ListReceivedLicensesHttp.js.map