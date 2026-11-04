import * as Layer from "effect/Layer";
import { GeneratePinData } from "./GeneratePinData.ts";
/**
 * HTTP implementation of {@link GeneratePinData} — grants the host Function
 * `payment-cryptography:GeneratePinData` on both the generation key (PVK)
 * and the encryption key (PEK) and calls the Payment Cryptography Data API
 * at runtime.
 */
export declare const GeneratePinDataHttp: Layer.Layer<GeneratePinData, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GeneratePinDataHttp.d.ts.map