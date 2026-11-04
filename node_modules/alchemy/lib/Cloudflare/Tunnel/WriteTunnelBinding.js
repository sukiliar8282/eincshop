import * as Layer from "effect/Layer";
import { makeTunnelClient } from "./TunnelBinding.js";
import { WriteTunnel, writeClient } from "./WriteTunnel.js";
/** Runtime layer for {@link WriteTunnel}. */
export const WriteTunnelBinding = Layer.effect(WriteTunnel, makeTunnelClient("Cloudflare.Tunnel.WriteTunnel", ["Cloudflare Tunnel Write"], writeClient));
//# sourceMappingURL=WriteTunnelBinding.js.map