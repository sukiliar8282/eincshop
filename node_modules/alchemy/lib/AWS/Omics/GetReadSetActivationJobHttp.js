import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { GetReadSetActivationJob } from "./GetReadSetActivationJob.js";
export const GetReadSetActivationJobHttp = Layer.effect(GetReadSetActivationJob, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.GetReadSetActivationJob",
    operation: omics.getReadSetActivationJob,
    actions: ["omics:GetReadSetActivationJob"],
    key: "sequenceStoreId",
    id: (store) => store.sequenceStoreId,
    arn: (store) => store.sequenceStoreArn,
}));
//# sourceMappingURL=GetReadSetActivationJobHttp.js.map