import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { StartReadSetActivationJob } from "./StartReadSetActivationJob.js";
export const StartReadSetActivationJobHttp = Layer.effect(StartReadSetActivationJob, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.StartReadSetActivationJob",
    operation: omics.startReadSetActivationJob,
    actions: ["omics:StartReadSetActivationJob"],
    key: "sequenceStoreId",
    id: (store) => store.sequenceStoreId,
    arn: (store) => store.sequenceStoreArn,
}));
//# sourceMappingURL=StartReadSetActivationJobHttp.js.map