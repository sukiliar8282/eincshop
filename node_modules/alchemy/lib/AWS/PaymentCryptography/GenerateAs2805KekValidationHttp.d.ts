import * as Layer from "effect/Layer";
import { GenerateAs2805KekValidation } from "./GenerateAs2805KekValidation.ts";
/**
 * HTTP implementation of {@link GenerateAs2805KekValidation} — grants the
 * host Function `payment-cryptography:GenerateAs2805KekValidation` on the
 * KEK and calls the Payment Cryptography Data API at runtime.
 */
export declare const GenerateAs2805KekValidationHttp: Layer.Layer<GenerateAs2805KekValidation, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GenerateAs2805KekValidationHttp.d.ts.map