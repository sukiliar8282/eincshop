import * as medicalimaging from "@distilled.cloud/aws/medical-imaging";
import * as Layer from "effect/Layer";
import { makeMedicalImagingDatastoreHttpBinding } from "./BindingHttp.js";
import { ListDICOMImportJobs } from "./ListDICOMImportJobs.js";
export const ListDICOMImportJobsHttp = Layer.effect(ListDICOMImportJobs, makeMedicalImagingDatastoreHttpBinding({
    tag: "AWS.MedicalImaging.ListDICOMImportJobs",
    operation: medicalimaging.listDICOMImportJobs,
    actions: ["medical-imaging:ListDICOMImportJobs"],
}));
//# sourceMappingURL=ListDICOMImportJobsHttp.js.map