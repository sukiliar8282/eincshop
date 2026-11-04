/** `Cloudflare.Container` bootstrap on the bun runtime. */
import { BunServices } from "@effect/platform-bun";
import { BunHttpServer } from "../../Http.js";
import { bootstrapContainer, } from "./CloudflareContainer.js";
export const bootstrap = (entrypoint, options) => bootstrapContainer({ services: BunServices.layer, httpServer: BunHttpServer() }, entrypoint, options);
//# sourceMappingURL=CloudflareContainerBun.js.map