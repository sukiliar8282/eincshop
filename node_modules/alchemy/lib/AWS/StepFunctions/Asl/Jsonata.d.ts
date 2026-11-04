/**
 * Phantom-typed JSONata value references for the Step Functions program DSL.
 *
 * An {@link Expr} is a *typed reference to a value that will exist at
 * execution time* — the execution input, the result of a previous state
 * (an ASL variable), the current Map item, etc. Property access is a Proxy
 * that builds up a JSONata path (`$states.context.Execution.Input.customerId`
 * style); comparator helpers (`eq`, `gt`, `and`, …) build boolean
 * expressions for Choice states.
 *
 * The same expression AST has two interpreters:
 * - `compile.ts` renders it to a `{% ... %}` JSONata string in the ASL
 *   definition,
 * - `simulate.ts` evaluates it in-process against a variable environment.
 */
/** Brand key carried by every {@link Expr} proxy. */
export declare const ExprTypeId: unique symbol;
export type ExprTypeId = typeof ExprTypeId;
/** The value roots a JSONata path can start from. */
export type ExprRoot = 
/** The state machine execution input (`$states.context.Execution.Input`). */
{
    readonly kind: "input";
}
/** An ASL variable assigned by an earlier state (`$name`). */
 | {
    readonly kind: "variable";
    readonly name: string;
}
/** The callback task token (`$states.context.Task.Token`). */
 | {
    readonly kind: "token";
};
/** Binary comparison / boolean operators supported by the expression AST. */
export type ExprOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "and" | "or";
/**
 * The untyped expression AST behind an {@link Expr} proxy. Plain data — both
 * the ASL printer and the local simulator interpret it structurally.
 */
export type ExprNode = {
    readonly _: "root";
    readonly root: ExprRoot;
} | {
    readonly _: "prop";
    readonly parent: ExprNode;
    readonly name: string;
} | {
    readonly _: "literal";
    readonly value: unknown;
} | {
    readonly _: "binop";
    readonly op: ExprOperator;
    readonly left: ExprNode;
    readonly right: ExprNode;
} | {
    readonly _: "not";
    readonly inner: ExprNode;
}
/** Raw JSONata escape hatch — compiles verbatim, unsupported by simulate. */
 | {
    readonly _: "raw";
    readonly jsonata: string;
};
interface ExprBrand<T> {
    readonly [ExprTypeId]: {
        readonly node: ExprNode;
        readonly _T: (_: never) => T;
    };
}
/**
 * A typed JSONata value reference. Property access is typed: given
 * `input: Expr<{ order: { total: number } }>`, `input.order.total` is an
 * `Expr<number>` that renders as `….order.total`.
 *
 * Arrays are opaque references (pass them to `Sfn.forEach`); primitives are
 * leaf references usable in comparators and payloads.
 */
export type Expr<T = any> = ExprBrand<T> & ([T] extends [readonly any[]] ? {} : [T] extends [object] ? {
    readonly [K in keyof T & string]-?: Expr<T[K]>;
} : {});
/** A value of `T`, a typed reference to one, or `Expr<any>` (untyped hole). */
export type ExprInput<T> = T | Expr<T> | Expr<any>;
/** Recursively replace `Expr<T>` references with their referent type. */
export type UnwrapExpr<T> = T extends Expr<infer A> ? A : T extends readonly (infer U)[] ? UnwrapExpr<U>[] : T extends object ? {
    [K in keyof T]: UnwrapExpr<T[K]>;
} : T;
/** Runtime guard for {@link Expr} proxies. */
export declare const isExpr: (value: unknown) => value is Expr<any>;
/** Extract the AST node from an {@link Expr}. */
export declare const nodeOf: (expr: Expr<any>) => ExprNode;
/**
 * Wrap an AST node in the typed Proxy. String property access appends a
 * `prop` node; everything else (symbols, `then`, iteration protocols) is
 * absent so the proxy never masquerades as a Promise, Effect, or Output.
 */
export declare const makeExpr: <T>(node: ExprNode) => Expr<T>;
/** Lift a value or Expr to an AST node. */
export declare const toNode: (value: unknown) => ExprNode;
/** Lift a constant into a typed expression. */
export declare const literal: <T>(value: T) => Expr<T>;
/**
 * Raw JSONata escape hatch. Compiles verbatim into the definition
 * (`{% <jsonata> %}`); `simulate` rejects it with a `SimulateError`.
 */
export declare const jsonata: <T = unknown>(expression: string) => Expr<T>;
/** `left = right` (JSONata equality). */
export declare const eq: <T>(left: ExprInput<T>, right: ExprInput<T>) => Expr<boolean>;
/** `left != right`. */
export declare const ne: <T>(left: ExprInput<T>, right: ExprInput<T>) => Expr<boolean>;
/** `left > right`. */
export declare const gt: (left: ExprInput<number>, right: ExprInput<number>) => Expr<boolean>;
/** `left >= right`. */
export declare const gte: (left: ExprInput<number>, right: ExprInput<number>) => Expr<boolean>;
/** `left < right`. */
export declare const lt: (left: ExprInput<number>, right: ExprInput<number>) => Expr<boolean>;
/** `left <= right`. */
export declare const lte: (left: ExprInput<number>, right: ExprInput<number>) => Expr<boolean>;
/** Boolean conjunction. */
export declare const and: (...conditions: [ExprInput<boolean>, ExprInput<boolean>, ...ExprInput<boolean>[]]) => Expr<boolean>;
/** Boolean disjunction. */
export declare const or: (...conditions: [ExprInput<boolean>, ExprInput<boolean>, ...ExprInput<boolean>[]]) => Expr<boolean>;
/** Boolean negation (`$not(...)`). */
export declare const not: (condition: ExprInput<boolean>) => Expr<boolean>;
/** The execution-input root expression. */
export declare const inputExpr: <T>() => Expr<T>;
/** A reference to the ASL variable `name`. */
export declare const variableExpr: <T>(name: string) => Expr<T>;
/**
 * The callback task token (`$states.context.Task.Token`) — embed inside
 * `Sfn.waitForTaskToken` arguments so the callback side can complete the
 * task via `SendTaskSuccess`/`SendTaskFailure`.
 */
export declare const taskToken: Expr<string>;
/** Render an AST node to JSONata source (without the `{% %}` wrapper). */
export declare const renderNode: (node: ExprNode) => string;
/** Render an {@link Expr} to a `{% ... %}`-wrapped ASL JSONata string. */
export declare const renderExprString: (expr: Expr<any>) => string;
export {};
//# sourceMappingURL=Jsonata.d.ts.map