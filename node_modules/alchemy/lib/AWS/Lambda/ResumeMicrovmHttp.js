import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { makeImageBinding } from "./MicrovmBinding.js";
import { ResumeMicrovm } from "./ResumeMicrovm.js";
export const ResumeMicrovmHttp = makeImageBinding({
    binding: ResumeMicrovm,
    name: "ResumeMicrovm",
    actions: ["lambda:ResumeMicrovm"],
    operation: microvms.resumeMicrovm,
    scope: "microvm",
});
//# sourceMappingURL=ResumeMicrovmHttp.js.map