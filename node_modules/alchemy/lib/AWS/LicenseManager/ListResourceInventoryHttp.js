import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseManagerHttpBinding } from "./BindingHttp.js";
import { ListResourceInventory } from "./ListResourceInventory.js";
export const ListResourceInventoryHttp = Layer.effect(ListResourceInventory, makeLicenseManagerHttpBinding({
    capability: "ListResourceInventory",
    iamActions: ["license-manager:ListResourceInventory"],
    operation: licensemanager.listResourceInventory,
}));
//# sourceMappingURL=ListResourceInventoryHttp.js.map