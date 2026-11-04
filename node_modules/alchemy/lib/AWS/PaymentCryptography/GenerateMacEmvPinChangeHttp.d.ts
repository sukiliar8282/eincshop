import * as Layer from "effect/Layer";
import { GenerateMacEmvPinChange } from "./GenerateMacEmvPinChange.ts";
/**
 * HTTP implementation of {@link GenerateMacEmvPinChange} — bespoke (not
 * scaffolded): the operation spans three keys (the new PIN PEK plus the
 * secure-messaging integrity and confidentiality keys). Grants the host
 * Function `payment-cryptography:GenerateMacEmvPinChange` on all three key
 * ARNs and injects each identifier at runtime.
 */
export declare const GenerateMacEmvPinChangeHttp: Layer.Layer<GenerateMacEmvPinChange, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GenerateMacEmvPinChangeHttp.d.ts.map