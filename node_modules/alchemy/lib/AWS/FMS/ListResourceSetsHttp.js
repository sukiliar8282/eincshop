import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { ListResourceSets } from "./ListResourceSets.js";
export const ListResourceSetsHttp = Layer.effect(ListResourceSets, makeFmsHttpBinding({
    capability: "ListResourceSets",
    iamActions: ["fms:ListResourceSets"],
    operation: fms.listResourceSets,
}));
//# sourceMappingURL=ListResourceSetsHttp.js.map