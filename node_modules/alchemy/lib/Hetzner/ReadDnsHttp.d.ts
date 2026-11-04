import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { type DnsAuth } from "./DnsHttp.ts";
import { ReadDns, type ReadDnsClient } from "./ReadDns.ts";
/** Runtime layer for {@link ReadDns}. */
export declare const ReadDnsHttp: Layer.Layer<ReadDns, never, import("@distilled.cloud/hetzner").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/** Build the read-only client over an injectable auth and zone id. */
export declare const dnsReadClient: (auth: DnsAuth, zoneId: Effect.Effect<number>) => ReadDnsClient;
//# sourceMappingURL=ReadDnsHttp.d.ts.map