import * as Layer from "effect/Layer";
import { RecognizeUtterance } from "./RecognizeUtterance.ts";
/**
 * HTTP implementation of {@link RecognizeUtterance} — calls the
 * `lex-runtime-v2` `RecognizeUtterance` operation with the Lambda role's
 * credentials and grants the host `lex:RecognizeUtterance` on the alias.
 */
export declare const RecognizeUtteranceHttp: Layer.Layer<RecognizeUtterance, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("@distilled.cloud/aws/Region").Region>;
//# sourceMappingURL=RecognizeUtteranceHttp.d.ts.map