import * as Effect from "effect/Effect";
export const assertDefined = (value, message) => {
    if (!value) {
        throw new Error(message);
    }
    return value;
};
export const asEffect = (effect) => typeof effect?.asEffect === "function"
    ? effect.asEffect()
    : Effect.isEffect(effect)
        ? effect
        : Effect.succeed(effect);
//# sourceMappingURL=types.js.map