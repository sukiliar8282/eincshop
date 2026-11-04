import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { StartReadSetExportJob } from "./StartReadSetExportJob.js";
export const StartReadSetExportJobHttp = Layer.effect(StartReadSetExportJob, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.StartReadSetExportJob",
    operation: omics.startReadSetExportJob,
    actions: ["omics:StartReadSetExportJob"],
    key: "sequenceStoreId",
    id: (store) => store.sequenceStoreId,
    arn: (store) => store.sequenceStoreArn,
    passRole: true,
}));
//# sourceMappingURL=StartReadSetExportJobHttp.js.map