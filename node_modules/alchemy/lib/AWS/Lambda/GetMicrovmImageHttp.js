import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { GetMicrovmImage } from "./GetMicrovmImage.js";
import { makeImageBinding } from "./MicrovmBinding.js";
export const GetMicrovmImageHttp = makeImageBinding({
    binding: GetMicrovmImage,
    name: "GetMicrovmImage",
    actions: ["lambda:GetMicrovmImage"],
    operation: microvms.getMicrovmImage,
    scope: "image",
    injectImageIdentifier: true,
});
//# sourceMappingURL=GetMicrovmImageHttp.js.map