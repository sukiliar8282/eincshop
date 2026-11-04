import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { StartReadSetImportJob } from "./StartReadSetImportJob.js";
export const StartReadSetImportJobHttp = Layer.effect(StartReadSetImportJob, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.StartReadSetImportJob",
    operation: omics.startReadSetImportJob,
    actions: ["omics:StartReadSetImportJob"],
    key: "sequenceStoreId",
    id: (store) => store.sequenceStoreId,
    arn: (store) => store.sequenceStoreArn,
    passRole: true,
}));
//# sourceMappingURL=StartReadSetImportJobHttp.js.map