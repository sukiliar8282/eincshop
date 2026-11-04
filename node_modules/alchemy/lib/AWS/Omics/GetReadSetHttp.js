import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { GetReadSet } from "./GetReadSet.js";
export const GetReadSetHttp = Layer.effect(GetReadSet, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.GetReadSet",
    operation: omics.getReadSet,
    actions: ["omics:GetReadSet"],
    key: "sequenceStoreId",
    id: (store) => store.sequenceStoreId,
    arn: (store) => store.sequenceStoreArn,
}));
//# sourceMappingURL=GetReadSetHttp.js.map