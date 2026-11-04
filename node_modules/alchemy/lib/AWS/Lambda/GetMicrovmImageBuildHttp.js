import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { GetMicrovmImageBuild } from "./GetMicrovmImageBuild.js";
import { makeImageBinding } from "./MicrovmBinding.js";
export const GetMicrovmImageBuildHttp = makeImageBinding({
    binding: GetMicrovmImageBuild,
    name: "GetMicrovmImageBuild",
    actions: ["lambda:GetMicrovmImageBuild"],
    operation: microvms.getMicrovmImageBuild,
    scope: "image",
    injectImageIdentifier: true,
});
//# sourceMappingURL=GetMicrovmImageBuildHttp.js.map