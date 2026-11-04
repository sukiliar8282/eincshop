import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { makeImageBinding } from "./MicrovmBinding.js";
import { RunMicrovm } from "./RunMicrovm.js";
export const RunMicrovmHttp = makeImageBinding({
    binding: RunMicrovm,
    name: "RunMicrovm",
    actions: ["lambda:RunMicrovm"],
    operation: microvms.runMicrovm,
    scope: "image",
    injectImageIdentifier: true,
    passNetworkConnector: true,
});
//# sourceMappingURL=RunMicrovmHttp.js.map