import * as bcm from "@distilled.cloud/aws/bcm-data-exports";
import * as Layer from "effect/Layer";
import { makeExportHttpBinding } from "./BindingHttp.js";
import { ListExecutions } from "./ListExecutions.js";
export const ListExecutionsHttp = Layer.effect(ListExecutions, makeExportHttpBinding({
    capability: "ListExecutions",
    iamActions: ["bcm-data-exports:ListExecutions"],
    operation: bcm.listExecutions,
}));
//# sourceMappingURL=ListExecutionsHttp.js.map