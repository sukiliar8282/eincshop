import * as medicalimaging from "@distilled.cloud/aws/medical-imaging";
import * as Layer from "effect/Layer";
import { makeMedicalImagingDatastoreHttpBinding } from "./BindingHttp.js";
import { UpdateImageSetMetadata } from "./UpdateImageSetMetadata.js";
export const UpdateImageSetMetadataHttp = Layer.effect(UpdateImageSetMetadata, makeMedicalImagingDatastoreHttpBinding({
    tag: "AWS.MedicalImaging.UpdateImageSetMetadata",
    operation: medicalimaging.updateImageSetMetadata,
    actions: ["medical-imaging:UpdateImageSetMetadata"],
}));
//# sourceMappingURL=UpdateImageSetMetadataHttp.js.map