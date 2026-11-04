import * as medicalimaging from "@distilled.cloud/aws/medical-imaging";
import * as Layer from "effect/Layer";
import { makeMedicalImagingDatastoreHttpBinding } from "./BindingHttp.js";
import { ListImageSetVersions } from "./ListImageSetVersions.js";
export const ListImageSetVersionsHttp = Layer.effect(ListImageSetVersions, makeMedicalImagingDatastoreHttpBinding({
    tag: "AWS.MedicalImaging.ListImageSetVersions",
    operation: medicalimaging.listImageSetVersions,
    actions: ["medical-imaging:ListImageSetVersions"],
}));
//# sourceMappingURL=ListImageSetVersionsHttp.js.map