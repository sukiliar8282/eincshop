import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { ListReadSetImportJobs } from "./ListReadSetImportJobs.js";
export const ListReadSetImportJobsHttp = Layer.effect(ListReadSetImportJobs, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.ListReadSetImportJobs",
    operation: omics.listReadSetImportJobs,
    actions: ["omics:ListReadSetImportJobs"],
    key: "sequenceStoreId",
    id: (store) => store.sequenceStoreId,
    arn: (store) => store.sequenceStoreArn,
}));
//# sourceMappingURL=ListReadSetImportJobsHttp.js.map