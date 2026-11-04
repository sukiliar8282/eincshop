import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.js";
import {} from "./TunnelBinding.js";
export const ReadTunnel = Binding.Service("Cloudflare.Tunnel.ReadTunnel");
/** Build the read-only client over an injectable {@link TunnelAuth}. */
export const readClient = (auth) => {
    const { authorize } = auth;
    return {
        get: Effect.fn("Cloudflare.Tunnel.get")(function* (tunnelId) {
            const accountId = yield* auth.accountId;
            return yield* authorize(zeroTrust.getTunnelCloudflared({ accountId, tunnelId }));
        }),
        list: Effect.fn("Cloudflare.Tunnel.list")(function* (request) {
            const accountId = yield* auth.accountId;
            return yield* authorize(zeroTrust.listTunnelCloudflareds({ accountId, ...request }));
        }),
        getToken: Effect.fn("Cloudflare.Tunnel.getToken")(function* (tunnelId) {
            const accountId = yield* auth.accountId;
            return yield* authorize(zeroTrust.getTunnelCloudflaredToken({ accountId, tunnelId }));
        }),
        getConfiguration: Effect.fn("Cloudflare.Tunnel.getConfiguration")(function* (tunnelId) {
            const accountId = yield* auth.accountId;
            return yield* authorize(zeroTrust.getTunnelCloudflaredConfiguration({ accountId, tunnelId }));
        }),
    };
};
//# sourceMappingURL=ReadTunnel.js.map