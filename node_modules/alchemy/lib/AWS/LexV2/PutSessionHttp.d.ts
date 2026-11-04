import * as Layer from "effect/Layer";
import { PutSession } from "./PutSession.ts";
/**
 * HTTP implementation of {@link PutSession} — calls the `lex-runtime-v2`
 * `PutSession` operation with the Lambda role's credentials and grants the
 * host `lex:PutSession` on the alias.
 */
export declare const PutSessionHttp: Layer.Layer<PutSession, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("@distilled.cloud/aws/Region").Region>;
//# sourceMappingURL=PutSessionHttp.d.ts.map