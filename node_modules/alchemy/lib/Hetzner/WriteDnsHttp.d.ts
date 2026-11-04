import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { type DnsAuth } from "./DnsHttp.ts";
import { WriteDns, type WriteDnsClient } from "./WriteDns.ts";
/** Runtime layer for {@link WriteDns}. */
export declare const WriteDnsHttp: Layer.Layer<WriteDns, never, import("@distilled.cloud/hetzner").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/** Build the write client over an injectable auth and zone id. */
export declare const dnsWriteClient: (auth: DnsAuth, zoneId: Effect.Effect<number>) => WriteDnsClient;
//# sourceMappingURL=WriteDnsHttp.d.ts.map