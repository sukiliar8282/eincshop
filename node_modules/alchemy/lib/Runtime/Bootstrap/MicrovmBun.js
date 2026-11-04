/** `AWS.Lambda.MicrovmImage` bootstrap on the bun runtime. */
import { BunServices } from "@effect/platform-bun";
import { BunHttpServer } from "../../Http.js";
import { bootstrapMicrovm } from "./Microvm.js";
export const bootstrap = (entrypoint, options) => bootstrapMicrovm({ services: BunServices.layer, httpServer: BunHttpServer() }, entrypoint, options);
//# sourceMappingURL=MicrovmBun.js.map