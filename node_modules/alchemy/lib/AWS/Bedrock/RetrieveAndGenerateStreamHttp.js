import * as bedrock from "@distilled.cloud/aws/bedrock-agent-runtime";
import * as Layer from "effect/Layer";
import { makeRagHttpBinding } from "./BindingHttp.js";
import { RetrieveAndGenerateStream } from "./RetrieveAndGenerateStream.js";
export const RetrieveAndGenerateStreamHttp = Layer.effect(RetrieveAndGenerateStream, makeRagHttpBinding({
    tag: "AWS.Bedrock.RetrieveAndGenerateStream",
    operation: bedrock.retrieveAndGenerateStream,
}));
//# sourceMappingURL=RetrieveAndGenerateStreamHttp.js.map