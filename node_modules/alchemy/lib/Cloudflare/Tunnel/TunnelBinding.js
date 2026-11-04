import * as Effect from "effect/Effect";
import { AccountApiToken } from "../ApiToken/AccountApiToken.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { authorizeWith } from "../HttpClientUtils.js";
import { Worker } from "../Workers/Worker.js";
/**
 * Shared runtime body for a tunnel binding. Mints a scoped
 * {@link AccountApiToken} (with the given permission groups), attaches the
 * narrow allow-policy to it (guarded by the runtime flag so it is a no-op once
 * deployed), binds the token's outputs into the Worker, then builds the client.
 *
 * Pass the result to `Layer.effect(<Callable>, ...)`.
 */
export const makeTunnelClient = (sid, permissionGroups, makeClient) => Effect.gen(function* () {
    const Token = yield* AccountApiToken;
    const env = yield* CloudflareEnvironment;
    return Effect.fn(function* () {
        const ctx = yield* Worker;
        const token = yield* Token(`${ctx.LogicalId}Token`);
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const { accountId } = yield* env;
            yield* token.bind(sid, {
                policies: [
                    {
                        effect: "allow",
                        permissionGroups,
                        resources: {
                            [`com.cloudflare.api.account.${accountId}`]: "*",
                        },
                    },
                ],
            });
        }
        return makeClient(makeTunnelAuth(yield* bindTunnelToken(token)));
    });
});
/** Build a scoped-token {@link TunnelAuth} from a bound {@link Token}. */
export const makeTunnelAuth = (token) => ({
    authorize: authorizeWith(token),
    accountId: token.accountId,
});
/**
 * Bind an {@link AccountApiToken}'s outputs into the Worker so they can be read
 * at runtime: `token.value` is injected as a `secret_text` binding and
 * `token.accountId` as `plain_text`. Returns the {@link Token} accessors.
 */
export const bindTunnelToken = (token) => Effect.gen(function* () {
    const value = yield* token.value;
    const accountId = yield* token.accountId;
    return { value, accountId };
});
//# sourceMappingURL=TunnelBinding.js.map