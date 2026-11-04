import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeHttpDnsBinding } from "./DnsHttp.js";
import { ReadDns } from "./ReadDns.js";
/** Runtime layer for {@link ReadDns}. */
export const ReadDnsHttp = Layer.effect(ReadDns, Effect.suspend(() => makeHttpDnsBinding({
    permissionGroups: ["DNS Read"],
    makeClient: dnsReadClient,
})));
/** Build the read-only client over an injectable auth and zone id. */
export const dnsReadClient = (auth, zoneId) => {
    const authorize = auth.authorize;
    return {
        getDnsRecord: Effect.fn("Cloudflare.DNS.getDnsRecord")(function* (dnsRecordId) {
            return yield* authorize(dns.getRecord({ zoneId: yield* zoneId, dnsRecordId }));
        }),
        listDnsRecords: Effect.fn("Cloudflare.DNS.listDnsRecords")(function* (request) {
            return yield* authorize(dns.listRecords({ zoneId: yield* zoneId, ...request }));
        }),
    };
};
//# sourceMappingURL=ReadDnsHttp.js.map