import * as medicalimaging from "@distilled.cloud/aws/medical-imaging";
import * as Layer from "effect/Layer";
import { makeMedicalImagingDatastoreHttpBinding } from "./BindingHttp.js";
import { GetImageSet } from "./GetImageSet.js";
export const GetImageSetHttp = Layer.effect(GetImageSet, makeMedicalImagingDatastoreHttpBinding({
    tag: "AWS.MedicalImaging.GetImageSet",
    operation: medicalimaging.getImageSet,
    actions: ["medical-imaging:GetImageSet"],
}));
//# sourceMappingURL=GetImageSetHttp.js.map