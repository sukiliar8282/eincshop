import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Effectable from "effect/Effectable";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import { AdoptPolicy } from "./AdoptPolicy.js";
import { toFqn } from "./FQN.js";
import { CurrentNamespace } from "./Namespace.js";
import * as Output from "./Output.js";
import { Provider } from "./Provider.js";
import { ConflictingProviderModeError, ProviderModePolicy, } from "./ProviderMode.js";
import { ref as makeRef } from "./Ref.js";
import { RemovalPolicy } from "./RemovalPolicy.js";
import { RenamePolicy } from "./Rename.js";
import { Self } from "./Self.js";
import { Stack } from "./Stack.js";
export const isResource = (value) => {
    // Require the full resource identity (Type AND FQN), not just `Type`:
    // user-authored prop objects legitimately carry a `Type` field (e.g.
    // Amazon States Language states like `{ Type: "Pass", End: true }` in a
    // Step Functions definition) and must not be mistaken for resources.
    // Locally-declared resources always expose both as own keys; refs
    // (`Resource.ref(...)`) deliberately report neither via `in` so they keep
    // routing through Output resolution.
    return (typeof value === "object" &&
        value !== null &&
        "Type" in value &&
        "FQN" in value);
};
/**
 * Does `value` reference an instance of the resource type `type` —
 * either a locally-declared resource or a `Resource.ref(...)` to one?
 *
 * Two constraints that ad-hoc guards get wrong for refs, which resolve
 * to Output-expression proxies:
 *
 * - Read `.Type` via property access (never `in`): the proxy answers
 *   property reads with statically-known values but deliberately does
 *   not report key existence (so {@link isResource} keeps routing refs
 *   through Output resolution instead of the upstream-node lookup).
 * - Accept `typeof value === "function"`: the proxy's target is
 *   callable (it needs an `apply` trap), so refs are not `"object"`.
 *
 * Either mistake silently rejects refs — in a Worker `env` that
 * degrades the binding to a plain JSON var.
 */
export const isResourceOfType = (value, type) => (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    value.Type === type;
/**
 * A tagged platform resource declared with neither props nor an inline
 * implementation was `yield*`ed, but its `.make(props, impl)` Layer never
 * built.
 *
 * Such a tag carries no configuration on its own — props AND impl both live
 * on the Layer — so its registration is a forward reference with `undefined`
 * props that the Layer's build repairs (in either order; see the #874
 * circular env-tag pattern). Props still `undefined` once the whole program
 * has evaluated means the Layer was never provided; `Plan.make` fails fast
 * with this error instead of letting the failure surface deep inside
 * whichever provider first reads a prop (e.g. `TypeError: undefined is not
 * an object (evaluating 'news.name')` in the Cloudflare Worker pre-create).
 */
export class MissingImplementationError extends Data.TaggedError("MissingImplementationError") {
}
export const missingImplementation = (type, id) => new MissingImplementationError({
    type,
    id,
    message: [
        `${type}<${id}> was yielded without its implementation.`,
        "",
        `\`${id}\` is declared as a bare tag — no props, no inline implementation — so both come from its \`.make(...)\` Layer:`,
        "",
        `  export class ${id} extends ${type}<${id}>()("${id}") {}`,
        `  export const ${id}Live = ${id}.make({ /* props */ }, Effect.gen(function* () { /* ... */ }));`,
        "",
        `That Layer is not in scope where \`${id}\` is yielded. Provide it to the Stack's program:`,
        "",
        "  Alchemy.Stack(",
        `    "my-stack",`,
        "    { providers, state },",
        "    Effect.gen(function* () {",
        `      const instance = yield* ${id};`,
        `    }).pipe(Effect.provide([${id}Live])),`,
        "  )",
        "",
        `If \`${id}\` is not Effect-native, declare it with props instead: \`()("${id}", { /* props */ })\`.`,
    ].join("\n"),
});
/**
 * Creates a resource constructor for a concrete resource type.
 *
 * The returned constructor registers the resource on the current stack,
 * resolves input props, exposes output attributes as `Output` expressions, and
 * records bindings contributed by policies and event sources. Resource
 * providers are attached separately through `.provider`.
 */
export function Resource(type, options) {
    const defaultRemovalPolicy = options?.defaultRemovalPolicy ?? "destroy";
    const self = Self(type);
    const constructor = (id, props) => Effect.gen(function* () {
        const stack = yield* Stack;
        const namespace = yield* CurrentNamespace;
        const fqn = toFqn(namespace, id);
        // `remote()` opts resources out of local emulation during dev. The
        // captured Mode is either "live" (pinned) or undefined (run default).
        // The Reference default is `undefined` — "no explicit decoration" —
        // which is distinct from an explicit `remote(false)`.
        const ambientPolicy = yield* ProviderModePolicy;
        const ambientMode = ambientPolicy
            ? "live"
            : undefined;
        const existing = stack.resources[fqn];
        if (existing) {
            // A resource may be `yield*`ed from several places (idempotent
            // registration). If a later site carries an *explicit* ambient
            // ProviderModePolicy that disagrees with what the resource was
            // registered with, the decorations are conflicting — fail loudly
            // instead of silently picking one. A later site with NO ambient
            // policy simply inherits the registered resource (the common
            // "reference it from elsewhere" pattern).
            if (ambientPolicy !== undefined && existing.Mode !== ambientMode) {
                return yield* Effect.die(new ConflictingProviderModeError({
                    message: `Resource '${fqn}' was registered with provider mode ` +
                        `'${existing.Mode ?? "default"}' but is now being registered ` +
                        `with conflicting mode '${ambientMode ?? "default"}'. A ` +
                        "resource must resolve to a single provider mode: register " +
                        "it once and close over the returned value, or make both " +
                        "registration sites agree (e.g. wrap both in the same " +
                        "`remote()` scope).",
                    fqn,
                    existingMode: existing.Mode,
                    conflictingMode: ambientMode,
                }));
            }
            // // TODO(sam): check if props are different and die
            return existing;
        }
        const bind = (...args) => typeof args[0] === "string"
            ? Effect.gen(function* () {
                const [sid, data] = args;
                (stack.bindings[fqn] ??= []).push({
                    sid,
                    data,
                });
                return undefined;
            })
            : (data) => {
                const stringifyBindArg = (arg) => {
                    if (arg === undefined) {
                        return undefined;
                    }
                    if (Array.isArray(arg)) {
                        return arg
                            .flatMap((item) => {
                            const stringified = stringifyBindArg(item);
                            return stringified === undefined ? [] : [stringified];
                        })
                            .join(", ");
                    }
                    if (arg &&
                        (typeof arg === "object" || typeof arg === "function")) {
                        if ("LogicalId" in arg && typeof arg.LogicalId === "string") {
                            return arg.LogicalId;
                        }
                        if ("id" in arg && typeof arg.id === "string") {
                            return arg.id;
                        }
                    }
                    return String(arg);
                };
                return bind(`${args[0]
                    .flatMap((text, i) => {
                    const stringified = stringifyBindArg(args[i + 1]);
                    return stringified !== undefined
                        ? [text, stringified]
                        : [text];
                })
                    .join("")}`, data);
            };
        const target = {
            Type: type,
            Namespace: namespace,
            FQN: fqn,
            LogicalId: id,
            Props: props,
            Provider: ProviderTag,
            RemovalPolicy: yield* Effect.serviceOption(RemovalPolicy).pipe(Effect.map(Option.getOrElse(() => defaultRemovalPolicy))),
            Adopt: yield* Effect.serviceOption(AdoptPolicy).pipe(Effect.map(Option.getOrUndefined)),
            Mode: ambientMode,
            RequiresImplementation: options?.requiresImplementation || undefined,
            // Bare-string former ids resolve against the SAME namespace as the
            // resource's own id, so `renamedFrom("Site/Worker")` declared at the
            // caller's level claims `<callerNs>/Site/Worker`; the `{ fqn }` form
            // is absolute (cross-namespace moves).
            FormerFqns: yield* Effect.serviceOption(RenamePolicy).pipe(Effect.map(Option.match({
                onNone: () => undefined,
                onSome: (formerIds) => formerIds.map((formerId) => typeof formerId === "string"
                    ? toFqn(namespace, formerId)
                    : formerId.fqn),
            }))),
            bind,
            toString() {
                return `Resource<${this.Type}>(${this.LogicalId})`;
            },
            [Symbol.toPrimitive](hint) {
                return hint === "number" ? NaN : this.toString();
            },
        };
        const Resource = (stack.resources[fqn] = new Proxy(target, {
            set: (t, prop, value) => {
                t[prop] = value;
                return true;
            },
            get: (t, prop) => typeof prop === "symbol" || prop in t
                ? t[prop]
                : new Output.PropExpr(Output.of(Resource), prop),
        }));
        Resource.Props = Effect.isEffect(props)
            ? // @effect-diagnostics-next-line anyUnknownInErrorContext:off
                yield* props.pipe(Effect.provide(Layer.mergeAll(Layer.succeed(Self, Resource), Layer.succeed(Self(type), Resource))))
            : props;
        return Resource;
    });
    const ProviderTag = Provider(type);
    const Service = {
        /**
         * Build a typed reference to a deployed instance of this resource
         * — in the current stack/stage by default, or in another via
         * `options`. Resolves to the same shape as `yield*
         * MyResource("id", props)` so downstream code can read attributes
         * (`ref.someAttr`) exactly the way it would for a locally-declared
         * resource.
         */
        ref: (id, options) => Effect.succeed(Output.of(makeRef(id, options, type))),
        Type: type,
        Provider: ProviderTag,
        Self: self,
        Aliases: options?.aliases,
    };
    const ResourceClass = Object.assign((...args) => typeof args[0] === "object"
        ? Object.assign(ResourceClass, args[0])
        : constructor(...args), Service, 
    // Make the constructor itself a real Effect: `yield* MyResource` resolves
    // to the constructor function (same as the old `asEffect()`), and
    // `Effect.isEffect(MyResource)` is now true so `Effect.all`/`forEach` work.
    Effectable.Prototype({
        label: `Resource<${type}>`,
        evaluate: () => Effect.succeed((id, props) => constructor(id, props)),
    }));
    return ResourceClass;
}
//# sourceMappingURL=Resource.js.map