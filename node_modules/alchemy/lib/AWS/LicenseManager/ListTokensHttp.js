import * as licensemanager from "@distilled.cloud/aws/license-manager";
import * as Layer from "effect/Layer";
import { makeLicenseManagerHttpBinding } from "./BindingHttp.js";
import { ListTokens } from "./ListTokens.js";
export const ListTokensHttp = Layer.effect(ListTokens, makeLicenseManagerHttpBinding({
    capability: "ListTokens",
    iamActions: ["license-manager:ListTokens"],
    operation: licensemanager.listTokens,
}));
//# sourceMappingURL=ListTokensHttp.js.map