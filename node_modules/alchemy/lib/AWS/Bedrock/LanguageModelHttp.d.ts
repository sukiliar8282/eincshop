import * as Layer from "effect/Layer";
import { LanguageModel } from "./LanguageModel.ts";
/**
 * HTTP implementation of {@link LanguageModel}. Composes the {@link Converse}
 * and {@link ConverseStream} bindings, so binding a model registers both
 * `bedrock:InvokeModel` and `bedrock:InvokeModelWithResponseStream` scoped to
 * exactly that model.
 */
export declare const LanguageModelHttp: Layer.Layer<LanguageModel, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=LanguageModelHttp.d.ts.map