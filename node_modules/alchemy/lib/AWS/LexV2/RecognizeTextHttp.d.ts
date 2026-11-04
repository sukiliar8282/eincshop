import * as Layer from "effect/Layer";
import { RecognizeText } from "./RecognizeText.ts";
/**
 * HTTP implementation of {@link RecognizeText} — calls the
 * `lex-runtime-v2` `RecognizeText` operation with the Lambda role's
 * credentials and grants the host `lex:RecognizeText` on the alias.
 */
export declare const RecognizeTextHttp: Layer.Layer<RecognizeText, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("@distilled.cloud/aws/Region").Region>;
//# sourceMappingURL=RecognizeTextHttp.d.ts.map