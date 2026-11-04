import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsResourceHttpBinding } from "./BindingHttp.js";
import { StartReferenceImportJob } from "./StartReferenceImportJob.js";
export const StartReferenceImportJobHttp = Layer.effect(StartReferenceImportJob, makeOmicsResourceHttpBinding({
    tag: "AWS.Omics.StartReferenceImportJob",
    operation: omics.startReferenceImportJob,
    actions: ["omics:StartReferenceImportJob"],
    key: "referenceStoreId",
    id: (store) => store.referenceStoreId,
    arn: (store) => store.referenceStoreArn,
    passRole: true,
}));
//# sourceMappingURL=StartReferenceImportJobHttp.js.map