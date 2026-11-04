import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { ListProtocolsLists } from "./ListProtocolsLists.js";
export const ListProtocolsListsHttp = Layer.effect(ListProtocolsLists, makeFmsHttpBinding({
    capability: "ListProtocolsLists",
    iamActions: ["fms:ListProtocolsLists"],
    operation: fms.listProtocolsLists,
}));
//# sourceMappingURL=ListProtocolsListsHttp.js.map