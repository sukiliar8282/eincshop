import * as Effect from "effect/Effect";
import type { Output as OutputType } from "../../Output.ts";
import type { Parameter } from "./Parameter.ts";
/**
 * Shared scaffolding for AWS SSM Parameter Store HTTP bindings.
 *
 * NOT exported from `index.ts` — every single-parameter `{Op}Http.ts` in this
 * service is a thin `Layer.effect(Cap, makeParameterHttpBinding({ … }))` over
 * this builder. Everything except the operation, the IAM action list, and the
 * granted ARNs is boilerplate:
 *
 * - the deploy-time half registers `Allow(host, tag(parameter))` with the
 *   requested `actions` on the bound parameter's ARN (or the ARNs produced by
 *   `resources` — e.g. the `${arn}/*` subtree wildcard for
 *   `GetParametersByPath`), plus an optional second statement granting
 *   `kmsActions` on the parameter's encryption key so `SecureString`
 *   decryption (`kms:Decrypt`) or encryption (`kms:Encrypt`,
 *   `kms:GenerateDataKey`) works out of the box;
 * - the runtime callable injects the resolved parameter name into the request
 *   under `requestKey` (`Name` by default, `Path` for the by-path read).
 *
 * Genuinely-different bindings stay bespoke: `GetParameters` (variadic
 * multi-parameter request with order-preserving name resolution).
 */
export declare const makeParameterHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SSM.GetParameterHistory`. */
    tag: string;
    /** The distilled operation the runtime callable invokes. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the bound parameter. */
    actions: readonly string[];
    /**
     * The request field the bound parameter's name is injected under.
     * @default "Name"
     */
    requestKey?: "Name" | "Path";
    /**
     * KMS actions granted on the parameter's encryption key. For
     * `String`/`StringList` parameters `keyArn` is undefined and the statement
     * falls back to the parameter's own ARN, which matches no KMS key — the
     * statement then grants nothing.
     */
    kmsActions?: readonly string[];
    /** ARNs the SSM actions are granted on. @default the parameter ARN */
    resources?: (parameter: Parameter) => (string | OutputType<string>)[];
}) => Effect.Effect<<P extends Parameter>(parameter: P) => Effect.Effect<(request?: Omit<I, "Name" | "Path"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map