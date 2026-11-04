import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { GetReadSetImportJob } from "./GetReadSetImportJob.js";
export const GetReadSetImportJobHttp = Layer.effect(GetReadSetImportJob, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.GetReadSetImportJob",
    operation: omics.getReadSetImportJob,
    actions: ["omics:GetReadSetImportJob"],
    key: "sequenceStoreId",
    id: (store) => store.sequenceStoreId,
    arn: (store) => store.sequenceStoreArn,
}));
//# sourceMappingURL=GetReadSetImportJobHttp.js.map