import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { makeImageBinding } from "./MicrovmBinding.js";
import { TerminateMicrovm } from "./TerminateMicrovm.js";
export const TerminateMicrovmHttp = makeImageBinding({
    binding: TerminateMicrovm,
    name: "TerminateMicrovm",
    actions: ["lambda:TerminateMicrovm"],
    operation: microvms.terminateMicrovm,
    scope: "microvm",
});
//# sourceMappingURL=TerminateMicrovmHttp.js.map