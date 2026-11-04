import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { type DnsAuth } from "./DnsHttp.ts";
import { ReadWriteDns, type ReadWriteDnsClient } from "./ReadWriteDns.ts";
/** Runtime layer for {@link ReadWriteDns}. */
export declare const ReadWriteDnsHttp: Layer.Layer<ReadWriteDns, never, import("../../Self.ts").Self<{
    Type: string;
    LogicalId: string;
}>>;
/** Build the combined read + write client over an injectable auth and zone id. */
export declare const dnsReadWriteClient: (auth: DnsAuth, zoneId: Effect.Effect<string>) => ReadWriteDnsClient;
//# sourceMappingURL=ReadWriteDnsHttp.d.ts.map