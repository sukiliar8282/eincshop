import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { ListReferenceImportJobs } from "./ListReferenceImportJobs.js";
export const ListReferenceImportJobsHttp = Layer.effect(ListReferenceImportJobs, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.ListReferenceImportJobs",
    operation: omics.listReferenceImportJobs,
    actions: ["omics:ListReferenceImportJobs"],
    key: "referenceStoreId",
    id: (store) => store.referenceStoreId,
    arn: (store) => store.referenceStoreArn,
}));
//# sourceMappingURL=ListReferenceImportJobsHttp.js.map