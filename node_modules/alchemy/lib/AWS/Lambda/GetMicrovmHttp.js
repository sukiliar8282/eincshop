import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { GetMicrovm } from "./GetMicrovm.js";
import { makeImageBinding } from "./MicrovmBinding.js";
export const GetMicrovmHttp = makeImageBinding({
    binding: GetMicrovm,
    name: "GetMicrovm",
    actions: ["lambda:GetMicrovm"],
    operation: microvms.getMicrovm,
    // MicroVM instance ARNs are minted at runtime; scope to the image's
    // `microvm:*` glob (this account/region) rather than `["*"]`.
    scope: "microvm",
});
//# sourceMappingURL=GetMicrovmHttp.js.map