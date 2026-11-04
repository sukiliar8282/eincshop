import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Layer from "effect/Layer";
import { makeInspector2AccountHttpBinding } from "./BindingHttp.js";
import { GetEncryptionKey } from "./GetEncryptionKey.js";
export const GetEncryptionKeyHttp = Layer.effect(GetEncryptionKey, makeInspector2AccountHttpBinding({
    tag: "AWS.Inspector2.GetEncryptionKey",
    operation: inspector2.getEncryptionKey,
    actions: ["inspector2:GetEncryptionKey"],
}));
//# sourceMappingURL=GetEncryptionKeyHttp.js.map