import * as lexr from "@distilled.cloud/aws/lex-runtime-v2";
import * as Layer from "effect/Layer";
import { makeLexAliasHttpBinding } from "./BindingHttp.js";
import { GetSession } from "./GetSession.js";
/**
 * HTTP implementation of {@link GetSession} — calls the `lex-runtime-v2`
 * `GetSession` operation with the Lambda role's credentials and grants the
 * host `lex:GetSession` on the alias.
 */
export const GetSessionHttp = Layer.effect(GetSession, makeLexAliasHttpBinding({
    capability: "GetSession",
    iamActions: ["lex:GetSession"],
    operation: lexr.getSession,
}));
//# sourceMappingURL=GetSessionHttp.js.map