import * as Layer from "effect/Layer";
import { GenerateCardValidationData } from "./GenerateCardValidationData.ts";
/**
 * HTTP implementation of {@link GenerateCardValidationData} — grants the
 * host Function `payment-cryptography:GenerateCardValidationData` on the CVK
 * and calls the Payment Cryptography Data API at runtime.
 */
export declare const GenerateCardValidationDataHttp: Layer.Layer<GenerateCardValidationData, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GenerateCardValidationDataHttp.d.ts.map