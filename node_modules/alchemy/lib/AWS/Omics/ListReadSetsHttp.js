import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { ListReadSets } from "./ListReadSets.js";
export const ListReadSetsHttp = Layer.effect(ListReadSets, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.ListReadSets",
    operation: omics.listReadSets,
    actions: ["omics:ListReadSets"],
    key: "sequenceStoreId",
    id: (store) => store.sequenceStoreId,
    arn: (store) => store.sequenceStoreArn,
}));
//# sourceMappingURL=ListReadSetsHttp.js.map