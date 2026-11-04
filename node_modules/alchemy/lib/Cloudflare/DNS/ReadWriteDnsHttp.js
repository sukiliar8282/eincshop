import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeHttpDnsBinding } from "./DnsHttp.js";
import { dnsReadClient } from "./ReadDnsHttp.js";
import { ReadWriteDns } from "./ReadWriteDns.js";
import { dnsWriteClient } from "./WriteDnsHttp.js";
/** Runtime layer for {@link ReadWriteDns}. */
export const ReadWriteDnsHttp = Layer.effect(ReadWriteDns, Effect.suspend(() => makeHttpDnsBinding({
    permissionGroups: ["DNS Read", "DNS Write"],
    makeClient: dnsReadWriteClient,
})));
/** Build the combined read + write client over an injectable auth and zone id. */
export const dnsReadWriteClient = (auth, zoneId) => ({
    ...dnsReadClient(auth, zoneId),
    ...dnsWriteClient(auth, zoneId),
});
//# sourceMappingURL=ReadWriteDnsHttp.js.map