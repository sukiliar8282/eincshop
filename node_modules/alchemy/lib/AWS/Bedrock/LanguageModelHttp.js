import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Converse } from "./Converse.js";
import { ConverseHttp } from "./ConverseHttp.js";
import { ConverseStream } from "./ConverseStream.js";
import { ConverseStreamHttp } from "./ConverseStreamHttp.js";
import { LanguageModel, makeLanguageModelLayer, } from "./LanguageModel.js";
/**
 * HTTP implementation of {@link LanguageModel}. Composes the {@link Converse}
 * and {@link ConverseStream} bindings, so binding a model registers both
 * `bedrock:InvokeModel` and `bedrock:InvokeModelWithResponseStream` scoped to
 * exactly that model.
 */
export const LanguageModelHttp = Layer.effect(LanguageModel, Effect.gen(function* () {
    const converse = yield* Converse;
    const converseStream = yield* ConverseStream;
    return Effect.fn(function* (model, options) {
        const [first, ...rest] = typeof model === "string" ? [model] : model;
        return makeLanguageModelLayer({
            converse: yield* converse(first, ...rest),
            converseStream: yield* converseStream(first, ...rest),
            parameters: options?.parameters,
        });
    });
})).pipe(Layer.provide(Layer.mergeAll(ConverseHttp, ConverseStreamHttp)));
//# sourceMappingURL=LanguageModelHttp.js.map