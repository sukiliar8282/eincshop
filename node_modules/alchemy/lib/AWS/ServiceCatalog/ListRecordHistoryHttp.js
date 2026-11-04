import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Layer from "effect/Layer";
import { makeServiceCatalogHttpBinding } from "./BindingHttp.js";
import { ListRecordHistory } from "./ListRecordHistory.js";
export const ListRecordHistoryHttp = Layer.effect(ListRecordHistory, makeServiceCatalogHttpBinding({
    capability: "ListRecordHistory",
    iamActions: ["servicecatalog:ListRecordHistory"],
    operation: servicecatalog.listRecordHistory,
}));
//# sourceMappingURL=ListRecordHistoryHttp.js.map