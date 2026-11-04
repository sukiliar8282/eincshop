import * as Layer from "effect/Layer";
import { makeTunnelClient } from "./TunnelBinding.js";
import { readWriteClient, ReadWriteTunnel } from "./ReadWriteTunnel.js";
/** Runtime layer for {@link ReadWriteTunnel}. */
export const ReadWriteTunnelBinding = Layer.effect(ReadWriteTunnel, makeTunnelClient("Cloudflare.Tunnel.ReadWriteTunnel", ["Cloudflare Tunnel Read", "Cloudflare Tunnel Write"], readWriteClient));
//# sourceMappingURL=ReadWriteTunnelBinding.js.map