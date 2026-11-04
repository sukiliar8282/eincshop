import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Effect from "effect/Effect";
/**
 * Read the observed tags for any IoT Wireless resource ARN. Tag reads are
 * best-effort — a race with deletion (or a missing-tags edge) degrades to an
 * empty record rather than failing the lifecycle operation.
 */
export declare const readIotWirelessTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Converge the tags on an IoT Wireless resource to `desired`, diffing against
 * the OBSERVED cloud tags so adoption converges.
 */
export declare const syncIotWirelessTags: (arn: string, desired: Record<string, string>) => Effect.Effect<void, iotw.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export declare const sameShape: (l: unknown, r: unknown) => boolean;
//# sourceMappingURL=internal.d.ts.map