import * as medicalimaging from "@distilled.cloud/aws/medical-imaging";
import * as Layer from "effect/Layer";
import { makeMedicalImagingDatastoreHttpBinding } from "./BindingHttp.js";
import { GetDICOMImportJob } from "./GetDICOMImportJob.js";
export const GetDICOMImportJobHttp = Layer.effect(GetDICOMImportJob, makeMedicalImagingDatastoreHttpBinding({
    tag: "AWS.MedicalImaging.GetDICOMImportJob",
    operation: medicalimaging.getDICOMImportJob,
    actions: ["medical-imaging:GetDICOMImportJob"],
}));
//# sourceMappingURL=GetDICOMImportJobHttp.js.map