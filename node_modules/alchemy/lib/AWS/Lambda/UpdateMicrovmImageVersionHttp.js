import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { makeImageBinding } from "./MicrovmBinding.js";
import { UpdateMicrovmImageVersion } from "./UpdateMicrovmImageVersion.js";
export const UpdateMicrovmImageVersionHttp = makeImageBinding({
    binding: UpdateMicrovmImageVersion,
    name: "UpdateMicrovmImageVersion",
    actions: ["lambda:UpdateMicrovmImageVersion"],
    operation: microvms.updateMicrovmImageVersion,
    scope: "image",
    injectImageIdentifier: true,
});
//# sourceMappingURL=UpdateMicrovmImageVersionHttp.js.map