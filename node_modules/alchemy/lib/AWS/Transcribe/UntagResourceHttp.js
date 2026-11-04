import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { UntagResource } from "./UntagResource.js";
export const UntagResourceHttp = Layer.effect(UntagResource, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.UntagResource",
    operation: transcribe.untagResource,
    actions: ["transcribe:UntagResource"],
}));
//# sourceMappingURL=UntagResourceHttp.js.map