import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { ListManagedMicrovmImageVersions } from "./ListManagedMicrovmImageVersions.js";
import { makeAccountBinding } from "./MicrovmBinding.js";
export const ListManagedMicrovmImageVersionsHttp = makeAccountBinding({
    binding: ListManagedMicrovmImageVersions,
    name: "ListManagedMicrovmImageVersions",
    actions: ["lambda:ListManagedMicrovmImageVersions"],
    operation: microvms.listManagedMicrovmImageVersions,
});
//# sourceMappingURL=ListManagedMicrovmImageVersionsHttp.js.map