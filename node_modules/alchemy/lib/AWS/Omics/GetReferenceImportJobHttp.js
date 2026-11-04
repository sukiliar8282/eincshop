import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { GetReferenceImportJob } from "./GetReferenceImportJob.js";
export const GetReferenceImportJobHttp = Layer.effect(GetReferenceImportJob, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.GetReferenceImportJob",
    operation: omics.getReferenceImportJob,
    actions: ["omics:GetReferenceImportJob"],
    key: "referenceStoreId",
    id: (store) => store.referenceStoreId,
    arn: (store) => store.referenceStoreArn,
}));
//# sourceMappingURL=GetReferenceImportJobHttp.js.map