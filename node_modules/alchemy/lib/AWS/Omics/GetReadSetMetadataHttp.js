import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { GetReadSetMetadata } from "./GetReadSetMetadata.js";
export const GetReadSetMetadataHttp = Layer.effect(GetReadSetMetadata, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.GetReadSetMetadata",
    operation: omics.getReadSetMetadata,
    actions: ["omics:GetReadSetMetadata"],
    key: "sequenceStoreId",
    id: (store) => store.sequenceStoreId,
    arn: (store) => store.sequenceStoreArn,
}));
//# sourceMappingURL=GetReadSetMetadataHttp.js.map