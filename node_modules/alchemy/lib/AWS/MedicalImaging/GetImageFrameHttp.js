import * as medicalimaging from "@distilled.cloud/aws/medical-imaging";
import * as Layer from "effect/Layer";
import { makeMedicalImagingDatastoreHttpBinding } from "./BindingHttp.js";
import { GetImageFrame } from "./GetImageFrame.js";
export const GetImageFrameHttp = Layer.effect(GetImageFrame, makeMedicalImagingDatastoreHttpBinding({
    tag: "AWS.MedicalImaging.GetImageFrame",
    operation: medicalimaging.getImageFrame,
    actions: ["medical-imaging:GetImageFrame"],
}));
//# sourceMappingURL=GetImageFrameHttp.js.map