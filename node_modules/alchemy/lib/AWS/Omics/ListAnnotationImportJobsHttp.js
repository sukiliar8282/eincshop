import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsAccountHttpBinding } from "./BindingHttp.js";
import { ListAnnotationImportJobs } from "./ListAnnotationImportJobs.js";
export const ListAnnotationImportJobsHttp = Layer.effect(ListAnnotationImportJobs, makeOmicsAccountHttpBinding({
    tag: "AWS.Omics.ListAnnotationImportJobs",
    operation: omics.listAnnotationImportJobs,
    actions: ["omics:ListAnnotationImportJobs"],
}));
//# sourceMappingURL=ListAnnotationImportJobsHttp.js.map