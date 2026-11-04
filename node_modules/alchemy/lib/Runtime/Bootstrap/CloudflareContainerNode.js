/** `Cloudflare.Container` bootstrap on the node runtime. */
import { NodeServices } from "@effect/platform-node";
import { NodeHttpServer } from "../../Http.js";
import { bootstrapContainer, } from "./CloudflareContainer.js";
export const bootstrap = (entrypoint, options) => bootstrapContainer({ services: NodeServices.layer, httpServer: NodeHttpServer() }, entrypoint, options);
//# sourceMappingURL=CloudflareContainerNode.js.map