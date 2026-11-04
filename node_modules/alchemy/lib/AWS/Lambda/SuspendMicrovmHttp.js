import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { makeImageBinding } from "./MicrovmBinding.js";
import { SuspendMicrovm } from "./SuspendMicrovm.js";
export const SuspendMicrovmHttp = makeImageBinding({
    binding: SuspendMicrovm,
    name: "SuspendMicrovm",
    actions: ["lambda:SuspendMicrovm"],
    operation: microvms.suspendMicrovm,
    scope: "microvm",
});
//# sourceMappingURL=SuspendMicrovmHttp.js.map