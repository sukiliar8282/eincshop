/** `AWS.Lambda.MicrovmImage` bootstrap on the node runtime. */
import { NodeServices } from "@effect/platform-node";
import { NodeHttpServer } from "../../Http.js";
import { bootstrapMicrovm } from "./Microvm.js";
export const bootstrap = (entrypoint, options) => bootstrapMicrovm({ services: NodeServices.layer, httpServer: NodeHttpServer() }, entrypoint, options);
//# sourceMappingURL=MicrovmNode.js.map