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
export const ExprTypeId = Symbol.for("alchemy/AWS/StepFunctions/JsonataExpr");
/** Runtime guard for {@link Expr} proxies. */
export const isExpr = (value) => (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    value[ExprTypeId] !== undefined;
/** Extract the AST node from an {@link Expr}. */
export const nodeOf = (expr) => expr[ExprTypeId].node;
/**
 * Wrap an AST node in the typed Proxy. String property access appends a
 * `prop` node; everything else (symbols, `then`, iteration protocols) is
 * absent so the proxy never masquerades as a Promise, Effect, or Output.
 */
export const makeExpr = (node) => {
    const brand = { node, _T: undefined };
    return new Proxy({}, {
        get: (_, prop) => {
            if (prop === ExprTypeId)
                return brand;
            if (typeof prop !== "string")
                return undefined;
            // `toJSON`/`then` lookups happen when host code probes values
            // (JSON.stringify, await). Treat them as path segments would be
            // wrong; renderers detect Exprs *before* serialization, so any
            // such probe reaching here is a misuse — return a child expr
            // anyway (harmless, typed access never sees these names).
            return makeExpr({ _: "prop", parent: node, name: prop });
        },
        has: (_, prop) => prop === ExprTypeId,
    });
};
const literalNode = (value) => ({ _: "literal", value });
/** Lift a value or Expr to an AST node. */
export const toNode = (value) => isExpr(value) ? nodeOf(value) : literalNode(value);
/** Lift a constant into a typed expression. */
export const literal = (value) => makeExpr(literalNode(value));
/**
 * Raw JSONata escape hatch. Compiles verbatim into the definition
 * (`{% <jsonata> %}`); `simulate` rejects it with a `SimulateError`.
 */
export const jsonata = (expression) => makeExpr({ _: "raw", jsonata: expression });
const binop = (op, left, right) => makeExpr({ _: "binop", op, left: toNode(left), right: toNode(right) });
/** `left = right` (JSONata equality). */
export const eq = (left, right) => binop("=", left, right);
/** `left != right`. */
export const ne = (left, right) => binop("!=", left, right);
/** `left > right`. */
export const gt = (left, right) => binop(">", left, right);
/** `left >= right`. */
export const gte = (left, right) => binop(">=", left, right);
/** `left < right`. */
export const lt = (left, right) => binop("<", left, right);
/** `left <= right`. */
export const lte = (left, right) => binop("<=", left, right);
/** Boolean conjunction. */
export const and = (...conditions) => conditions
    .slice(1)
    .reduce((acc, c) => binop("and", acc, c), isExpr(conditions[0])
    ? conditions[0]
    : literal(conditions[0]));
/** Boolean disjunction. */
export const or = (...conditions) => conditions
    .slice(1)
    .reduce((acc, c) => binop("or", acc, c), isExpr(conditions[0])
    ? conditions[0]
    : literal(conditions[0]));
/** Boolean negation (`$not(...)`). */
export const not = (condition) => makeExpr({ _: "not", inner: toNode(condition) });
/** The execution-input root expression. */
export const inputExpr = () => makeExpr({ _: "root", root: { kind: "input" } });
/** A reference to the ASL variable `name`. */
export const variableExpr = (name) => makeExpr({ _: "root", root: { kind: "variable", name } });
/**
 * The callback task token (`$states.context.Task.Token`) — embed inside
 * `Sfn.waitForTaskToken` arguments so the callback side can complete the
 * task via `SendTaskSuccess`/`SendTaskFailure`.
 */
export const taskToken = makeExpr({
    _: "root",
    root: { kind: "token" },
});
// ---------------------------------------------------------------------------
// JSONata printer (used by compile.ts)
// ---------------------------------------------------------------------------
const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
const renderRoot = (root) => {
    switch (root.kind) {
        case "input":
            return "$states.context.Execution.Input";
        case "variable":
            return `$${root.name}`;
        case "token":
            return "$states.context.Task.Token";
    }
};
/** Render an AST node to JSONata source (without the `{% %}` wrapper). */
export const renderNode = (node) => {
    switch (node._) {
        case "root":
            return renderRoot(node.root);
        case "prop": {
            const parent = node.parent._ === "root" || node.parent._ === "prop"
                ? renderNode(node.parent)
                : `(${renderNode(node.parent)})`;
            return IDENT.test(node.name)
                ? `${parent}.${node.name}`
                : `${parent}.\`${node.name}\``;
        }
        case "literal":
            return JSON.stringify(node.value === undefined ? null : node.value);
        case "binop":
            return `(${renderNode(node.left)} ${node.op} ${renderNode(node.right)})`;
        case "not":
            return `$not(${renderNode(node.inner)})`;
        case "raw":
            return node.jsonata;
    }
};
/** Render an {@link Expr} to a `{% ... %}`-wrapped ASL JSONata string. */
export const renderExprString = (expr) => `{% ${renderNode(nodeOf(expr))} %}`;
//# sourceMappingURL=Jsonata.js.map