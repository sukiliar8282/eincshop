import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { GetReference } from "./GetReference.js";
export const GetReferenceHttp = Layer.effect(GetReference, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.GetReference",
    operation: omics.getReference,
    actions: ["omics:GetReference"],
    key: "referenceStoreId",
    id: (store) => store.referenceStoreId,
    arn: (store) => store.referenceStoreArn,
}));
//# sourceMappingURL=GetReferenceHttp.js.map