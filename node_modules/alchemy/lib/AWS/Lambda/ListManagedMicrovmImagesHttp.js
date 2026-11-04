import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { ListManagedMicrovmImages } from "./ListManagedMicrovmImages.js";
import { makeAccountBinding } from "./MicrovmBinding.js";
export const ListManagedMicrovmImagesHttp = makeAccountBinding({
    binding: ListManagedMicrovmImages,
    name: "ListManagedMicrovmImages",
    actions: ["lambda:ListManagedMicrovmImages"],
    operation: microvms.listManagedMicrovmImages,
});
//# sourceMappingURL=ListManagedMicrovmImagesHttp.js.map