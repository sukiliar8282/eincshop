import * as medicalimaging from "@distilled.cloud/aws/medical-imaging";
import * as Layer from "effect/Layer";
import { makeMedicalImagingDatastoreHttpBinding } from "./BindingHttp.js";
import { GetImageSetMetadata } from "./GetImageSetMetadata.js";
export const GetImageSetMetadataHttp = Layer.effect(GetImageSetMetadata, makeMedicalImagingDatastoreHttpBinding({
    tag: "AWS.MedicalImaging.GetImageSetMetadata",
    operation: medicalimaging.getImageSetMetadata,
    actions: ["medical-imaging:GetImageSetMetadata"],
}));
//# sourceMappingURL=GetImageSetMetadataHttp.js.map