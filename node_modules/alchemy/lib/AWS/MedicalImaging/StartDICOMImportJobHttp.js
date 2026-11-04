import * as medicalimaging from "@distilled.cloud/aws/medical-imaging";
import * as Layer from "effect/Layer";
import { makeMedicalImagingStartJobHttpBinding } from "./BindingHttp.js";
import { StartDICOMImportJob } from "./StartDICOMImportJob.js";
export const StartDICOMImportJobHttp = Layer.effect(StartDICOMImportJob, makeMedicalImagingStartJobHttpBinding({
    tag: "AWS.MedicalImaging.StartDICOMImportJob",
    operation: medicalimaging.startDICOMImportJob,
    actions: ["medical-imaging:StartDICOMImportJob"],
}));
//# sourceMappingURL=StartDICOMImportJobHttp.js.map