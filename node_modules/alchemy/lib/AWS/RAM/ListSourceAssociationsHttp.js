import * as ram from "@distilled.cloud/aws/ram";
import * as Layer from "effect/Layer";
import { makeRAMHttpBinding } from "./BindingHttp.js";
import { ListSourceAssociations } from "./ListSourceAssociations.js";
export const ListSourceAssociationsHttp = Layer.effect(ListSourceAssociations, makeRAMHttpBinding({
    capability: "ListSourceAssociations",
    iamActions: ["ram:ListSourceAssociations"],
    operation: ram.listSourceAssociations,
}));
//# sourceMappingURL=ListSourceAssociationsHttp.js.map