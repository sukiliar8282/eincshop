import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { ListMicrovmImageVersions } from "./ListMicrovmImageVersions.js";
import { makeImageBinding } from "./MicrovmBinding.js";
export const ListMicrovmImageVersionsHttp = makeImageBinding({
    binding: ListMicrovmImageVersions,
    name: "ListMicrovmImageVersions",
    actions: ["lambda:ListMicrovmImageVersions"],
    operation: microvms.listMicrovmImageVersions,
    scope: "image",
    injectImageIdentifier: true,
});
//# sourceMappingURL=ListMicrovmImageVersionsHttp.js.map