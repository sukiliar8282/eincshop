import * as Layer from "effect/Layer";
import { TranslatePinData } from "./TranslatePinData.ts";
/**
 * HTTP implementation of {@link TranslatePinData} — grants the host Function
 * `payment-cryptography:TranslatePinData` on both the incoming and outgoing
 * PIN encryption keys and calls the Payment Cryptography Data API at
 * runtime.
 */
export declare const TranslatePinDataHttp: Layer.Layer<TranslatePinData, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=TranslatePinDataHttp.d.ts.map