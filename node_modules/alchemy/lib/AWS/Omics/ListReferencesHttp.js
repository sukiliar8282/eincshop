import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { ListReferences } from "./ListReferences.js";
export const ListReferencesHttp = Layer.effect(ListReferences, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.ListReferences",
    operation: omics.listReferences,
    actions: ["omics:ListReferences"],
    key: "referenceStoreId",
    id: (store) => store.referenceStoreId,
    arn: (store) => store.referenceStoreArn,
}));
//# sourceMappingURL=ListReferencesHttp.js.map