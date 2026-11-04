import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseManagerHttpBinding } from "./BindingHttp.js";
import { ListReceivedGrants } from "./ListReceivedGrants.js";
export const ListReceivedGrantsHttp = Layer.effect(ListReceivedGrants, makeLicenseManagerHttpBinding({
    capability: "ListReceivedGrants",
    iamActions: ["license-manager:ListReceivedGrants"],
    operation: licensemanager.listReceivedGrants,
}));
//# sourceMappingURL=ListReceivedGrantsHttp.js.map