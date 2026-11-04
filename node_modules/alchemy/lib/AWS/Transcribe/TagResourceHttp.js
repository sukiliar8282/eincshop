import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { TagResource } from "./TagResource.js";
export const TagResourceHttp = Layer.effect(TagResource, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.TagResource",
    operation: transcribe.tagResource,
    actions: ["transcribe:TagResource"],
}));
//# sourceMappingURL=TagResourceHttp.js.map