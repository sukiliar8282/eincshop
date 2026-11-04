import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseManagerHttpBinding } from "./BindingHttp.js";
import { ListDistributedGrants } from "./ListDistributedGrants.js";
export const ListDistributedGrantsHttp = Layer.effect(ListDistributedGrants, makeLicenseManagerHttpBinding({
    capability: "ListDistributedGrants",
    iamActions: ["license-manager:ListDistributedGrants"],
    operation: licensemanager.listDistributedGrants,
}));
//# sourceMappingURL=ListDistributedGrantsHttp.js.map