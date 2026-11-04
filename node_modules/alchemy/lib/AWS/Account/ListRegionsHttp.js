import * as account from "@distilled.cloud/aws/account";
import * as Layer from "effect/Layer";
import { makeAccountHttpBinding } from "./BindingHttp.js";
import { ListRegions } from "./ListRegions.js";
export const ListRegionsHttp = Layer.effect(ListRegions, makeAccountHttpBinding({
    capability: "ListRegions",
    iamActions: ["account:ListRegions"],
    operation: account.listRegions,
}));
//# sourceMappingURL=ListRegionsHttp.js.map