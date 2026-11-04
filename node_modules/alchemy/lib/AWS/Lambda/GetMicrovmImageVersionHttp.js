import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { GetMicrovmImageVersion } from "./GetMicrovmImageVersion.js";
import { makeImageBinding } from "./MicrovmBinding.js";
export const GetMicrovmImageVersionHttp = makeImageBinding({
    binding: GetMicrovmImageVersion,
    name: "GetMicrovmImageVersion",
    actions: ["lambda:GetMicrovmImageVersion"],
    operation: microvms.getMicrovmImageVersion,
    scope: "image",
    injectImageIdentifier: true,
});
//# sourceMappingURL=GetMicrovmImageVersionHttp.js.map