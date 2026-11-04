import * as Layer from "effect/Layer";
import { makeTunnelClient } from "./TunnelBinding.js";
import { readClient, ReadTunnel } from "./ReadTunnel.js";
/** Runtime layer for {@link ReadTunnel}. */
export const ReadTunnelBinding = Layer.effect(ReadTunnel, makeTunnelClient("Cloudflare.Tunnel.ReadTunnel", ["Cloudflare Tunnel Read"], readClient));
//# sourceMappingURL=ReadTunnelBinding.js.map