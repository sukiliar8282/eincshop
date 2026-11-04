import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { GetReadSetExportJob } from "./GetReadSetExportJob.js";
export const GetReadSetExportJobHttp = Layer.effect(GetReadSetExportJob, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.GetReadSetExportJob",
    operation: omics.getReadSetExportJob,
    actions: ["omics:GetReadSetExportJob"],
    key: "sequenceStoreId",
    id: (store) => store.sequenceStoreId,
    arn: (store) => store.sequenceStoreArn,
}));
//# sourceMappingURL=GetReadSetExportJobHttp.js.map