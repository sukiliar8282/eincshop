import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { ListReadSetActivationJobs } from "./ListReadSetActivationJobs.js";
export const ListReadSetActivationJobsHttp = Layer.effect(ListReadSetActivationJobs, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.ListReadSetActivationJobs",
    operation: omics.listReadSetActivationJobs,
    actions: ["omics:ListReadSetActivationJobs"],
    key: "sequenceStoreId",
    id: (store) => store.sequenceStoreId,
    arn: (store) => store.sequenceStoreArn,
}));
//# sourceMappingURL=ListReadSetActivationJobsHttp.js.map