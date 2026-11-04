import * as quicksight from "@distilled.cloud/aws/quicksight";
import * as Layer from "effect/Layer";
import { makeQuickSightDataSetHttpBinding } from "./BindingHttp.js";
import { ListIngestions } from "./ListIngestions.js";
export const ListIngestionsHttp = Layer.effect(ListIngestions, makeQuickSightDataSetHttpBinding({
    tag: "AWS.QuickSight.ListIngestions",
    operation: quicksight.listIngestions,
    actions: ["quicksight:ListIngestions"],
}));
//# sourceMappingURL=ListIngestionsHttp.js.map