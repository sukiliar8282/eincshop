import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.js";
import {} from "./TunnelBinding.js";
import { readClient } from "./ReadTunnel.js";
import { writeClient } from "./WriteTunnel.js";
export const ReadWriteTunnel = Binding.Service("Cloudflare.Tunnel.ReadWriteTunnel");
/** Build the combined read + write client over an injectable {@link TunnelAuth}. */
export const readWriteClient = (auth) => ({
    ...readClient(auth),
    ...writeClient(auth),
});
//# sourceMappingURL=ReadWriteTunnel.js.map