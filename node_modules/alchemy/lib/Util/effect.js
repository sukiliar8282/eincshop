import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Effectable from "effect/Effectable";
export const effectClass = ((impl) => impl === undefined
    ? (innerImpl) => effectClass(innerImpl)
    : Object.assign(class {
    }, 
    // Spreading the Effect prototype onto the class (static side) makes the
    // class itself a real Effect — `Effect.isEffect(X)` is true, so
    // `Effect.all([X])` / `Effect.forEach` work — and subclasses
    // (`class Y extends effectClass(impl)`) inherit the protocol statically.
    Effectable.Prototype({
        label: "alchemy/EffectClass",
        evaluate: () => impl,
    })));
export const taggedFunction = (tag, fn) => {
    // The Proxy below forwards every Effect-protocol key to `tag` (already an
    // Effect), so `asEffect`/`[Symbol.iterator]`/`pipe` need no explicit
    // override — only `toString` diverges.
    const overrides = {
        toString: () => `${tag.toString()}.${fn.name}`,
    };
    return new Proxy(fn, {
        get: (target, prop, receiver) => Reflect.has(overrides, prop)
            ? Reflect.get(overrides, prop, receiver)
            : Reflect.has(target, prop)
                ? Reflect.get(target, prop, receiver)
                : Reflect.get(tag, prop, tag),
        has: (target, prop) => Reflect.has(overrides, prop) ||
            Reflect.has(target, prop) ||
            Reflect.has(tag, prop),
    });
};
export const isYieldableEffect = (value) => Effect.isEffect(value) &&
    typeof value[Symbol.iterator] ===
        "function";
export const isEffectClassLike = (value) => typeof value === "function" &&
    typeof value.asEffect === "function";
export const isYieldableEffectLike = (value) => (isYieldableEffect(value) || isEffectClassLike(value)) &&
    !("~alchemy/Kind" in value);
export const toEffectInterface = (raw) => ({
    raw,
    ...Object.fromEntries(Object.entries(raw).map(([key, value]) => [
        key,
        typeof value === "function"
            ? (...args) => Effect.tryPromise(async () => value(...args))
            : value,
    ])),
});
//# sourceMappingURL=effect.js.map