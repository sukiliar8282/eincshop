import * as Layer from "effect/Layer";
import { DeleteSession } from "./DeleteSession.ts";
/**
 * HTTP implementation of {@link DeleteSession} — calls the `lex-runtime-v2`
 * `DeleteSession` operation with the Lambda role's credentials and grants
 * the host `lex:DeleteSession` on the alias.
 */
export declare const DeleteSessionHttp: Layer.Layer<DeleteSession, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("@distilled.cloud/aws/Region").Region>;
//# sourceMappingURL=DeleteSessionHttp.d.ts.map