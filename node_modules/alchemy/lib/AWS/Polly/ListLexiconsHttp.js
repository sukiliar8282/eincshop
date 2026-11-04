import * as polly from "@distilled.cloud/aws/polly";
import * as Layer from "effect/Layer";
import { makePollyHttpBinding } from "./BindingHttp.js";
import { ListLexicons } from "./ListLexicons.js";
export const ListLexiconsHttp = Layer.effect(ListLexicons, makePollyHttpBinding({
    capability: "ListLexicons",
    iamActions: ["polly:ListLexicons"],
    operation: polly.listLexicons,
}));
//# sourceMappingURL=ListLexiconsHttp.js.map