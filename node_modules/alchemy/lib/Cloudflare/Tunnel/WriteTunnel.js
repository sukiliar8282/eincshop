import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.js";
import {} from "./TunnelBinding.js";
export const WriteTunnel = Binding.Service("Cloudflare.Tunnel.WriteTunnel");
/** Build the write client over an injectable {@link TunnelAuth}. */
export const writeClient = (auth) => {
    const { authorize } = auth;
    return {
        create: Effect.fn("Cloudflare.Tunnel.create")(function* (request) {
            const accountId = yield* auth.accountId;
            return yield* authorize(zeroTrust.createTunnelCloudflared({ accountId, ...request }));
        }),
        update: Effect.fn("Cloudflare.Tunnel.update")(function* (tunnelId, request) {
            const accountId = yield* auth.accountId;
            return yield* authorize(zeroTrust.patchTunnelCloudflared({ accountId, tunnelId, ...request }));
        }),
        delete: Effect.fn("Cloudflare.Tunnel.delete")(function* (tunnelId) {
            const accountId = yield* auth.accountId;
            return yield* authorize(zeroTrust.deleteTunnelCloudflared({ accountId, tunnelId }));
        }),
        putConfiguration: Effect.fn("Cloudflare.Tunnel.putConfiguration")(function* (tunnelId, config) {
            const accountId = yield* auth.accountId;
            return yield* authorize(zeroTrust.putTunnelCloudflaredConfiguration({
                accountId,
                tunnelId,
                config,
            }));
        }),
    };
};
//# sourceMappingURL=WriteTunnel.js.map