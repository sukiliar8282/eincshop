import * as ram from "@distilled.cloud/aws/ram";
import * as Layer from "effect/Layer";
import { makeRAMHttpBinding } from "./BindingHttp.js";
import { ListPrincipals } from "./ListPrincipals.js";
export const ListPrincipalsHttp = Layer.effect(ListPrincipals, makeRAMHttpBinding({
    capability: "ListPrincipals",
    iamActions: ["ram:ListPrincipals"],
    operation: ram.listPrincipals,
}));
//# sourceMappingURL=ListPrincipalsHttp.js.map