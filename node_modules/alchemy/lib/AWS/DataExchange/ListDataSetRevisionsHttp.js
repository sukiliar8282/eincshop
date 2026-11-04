import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeDataSetHttpBinding } from "./BindingHttp.js";
import { ListDataSetRevisions } from "./ListDataSetRevisions.js";
export const ListDataSetRevisionsHttp = Layer.effect(ListDataSetRevisions, makeDataSetHttpBinding({
    tag: "AWS.DataExchange.ListDataSetRevisions",
    operation: dataexchange.listDataSetRevisions,
    actions: ["dataexchange:ListDataSetRevisions"],
}));
//# sourceMappingURL=ListDataSetRevisionsHttp.js.map