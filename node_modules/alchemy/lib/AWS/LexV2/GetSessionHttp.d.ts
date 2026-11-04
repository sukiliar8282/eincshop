import * as Layer from "effect/Layer";
import { GetSession } from "./GetSession.ts";
/**
 * HTTP implementation of {@link GetSession} — calls the `lex-runtime-v2`
 * `GetSession` operation with the Lambda role's credentials and grants the
 * host `lex:GetSession` on the alias.
 */
export declare const GetSessionHttp: Layer.Layer<GetSession, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("@distilled.cloud/aws/Region").Region>;
//# sourceMappingURL=GetSessionHttp.d.ts.map