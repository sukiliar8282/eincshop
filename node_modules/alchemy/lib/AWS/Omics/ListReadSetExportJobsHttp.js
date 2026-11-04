import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { ListReadSetExportJobs } from "./ListReadSetExportJobs.js";
export const ListReadSetExportJobsHttp = Layer.effect(ListReadSetExportJobs, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.ListReadSetExportJobs",
    operation: omics.listReadSetExportJobs,
    actions: ["omics:ListReadSetExportJobs"],
    key: "sequenceStoreId",
    id: (store) => store.sequenceStoreId,
    arn: (store) => store.sequenceStoreArn,
}));
//# sourceMappingURL=ListReadSetExportJobsHttp.js.map