import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { GetReferenceMetadata } from "./GetReferenceMetadata.js";
export const GetReferenceMetadataHttp = Layer.effect(GetReferenceMetadata, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.GetReferenceMetadata",
    operation: omics.getReferenceMetadata,
    actions: ["omics:GetReferenceMetadata"],
    key: "referenceStoreId",
    id: (store) => store.referenceStoreId,
    arn: (store) => store.referenceStoreArn,
}));
//# sourceMappingURL=GetReferenceMetadataHttp.js.map