import * as Layer from "effect/Layer";
import { UpdateIPSet } from "./UpdateIPSet.ts";
/**
 * Bespoke (multi-op) binding: reads the IP set for a fresh `LockToken`,
 * applies the full-replacement update, and retries optimistic-lock
 * conflicts by re-reading.
 */
export declare const UpdateIPSetHttp: Layer.Layer<UpdateIPSet, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=UpdateIPSetHttp.d.ts.map