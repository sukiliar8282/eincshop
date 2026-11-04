import * as Effect from "effect/Effect";
import * as Output from "../../Output.js";
import { Self } from "../../Self.js";
import { AccountApiToken } from "../ApiToken/AccountApiToken.js";
import { authorizeWith } from "../HttpClientUtils.js";
/**
 * Shared scaffolding for the HTTP-backed DNS bindings.
 *
 * Creates a least-privilege {@link AccountApiToken} scoped to the requested
 * zone, binds its `value` into the host Worker at deploy time (guarded by
 * `__ALCHEMY_RUNTIME__` so it is a no-op once running inside the deployed
 * Worker), then delegates to `makeClient` with the bound token and the zone's
 * `zoneId`.
 *
 * The zone's `zoneId` is bound into the Worker at init time, so the resulting
 * client closes over it and callers never pass it per request — the
 * provisioned token only grants access to that one zone anyway.
 */
export const makeHttpDnsBinding = (options) => Effect.gen(function* () {
    const Token = yield* AccountApiToken;
    const self = yield* Self;
    return Effect.fn(function* (zone) {
        const token = yield* Token(`${self.LogicalId}Token`);
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* token.bind `${self.LogicalId}(${zone})`({
                policies: [
                    {
                        effect: "allow",
                        permissionGroups: options.permissionGroups,
                        resources: zone.zoneId.pipe(Output.flatMap((zoneId) => Output.interpolate `com.cloudflare.api.account.zone.${zoneId}`), Output.map((zoneId) => ({
                            [zoneId]: "*",
                        }))),
                    },
                ],
            });
        }
        const bound = {
            value: yield* token.value,
        };
        const zoneId = yield* zone.zoneId;
        return options.makeClient(makeDnsAuth(bound), zoneId);
    });
});
/** Build a scoped-token {@link DnsAuth} from a bound {@link Token}. */
export const makeDnsAuth = (token) => ({
    authorize: authorizeWith(token),
});
//# sourceMappingURL=DnsHttp.js.map