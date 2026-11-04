import type { NamespaceNode } from "./Namespace.ts";
/**
 * Separator used in FQN strings.
 */
export declare const FQN_SEPARATOR = "/";
/**
 * Encode an FQN for safe filesystem storage.
 * Replaces `/` (FQN separator) with `__` to avoid subdirectory creation.
 */
export declare const encodeFqn: (fqn: string) => string;
/**
 * Decode a filename back to FQN.
 */
export declare const decodeFqn: (filename: string) => string;
/**
 * Convert a NamespaceNode chain to an array of namespace IDs, from root to leaf.
 *
 * @example
 * ```ts
 * const ns = { Id: "Child", Parent: { Id: "Parent", Parent: { Id: "Root" } } };
 * toPath(ns); // ["Root", "Parent", "Child"]
 * ```
 */
export declare const toPath: (ns: NamespaceNode | undefined) => string[];
/**
 * Create a fully-qualified name (FQN) from a namespace and logical ID.
 * The FQN is a flat key suitable for state storage.
 *
 * @example
 * ```ts
 * const ns = { Id: "Child", Parent: { Id: "Parent" } };
 * toFqn(ns, "MyResource"); // "Parent/Child/MyResource"
 * toFqn(undefined, "MyResource"); // "MyResource"
 * ```
 */
export declare const toFqn: (ns: NamespaceNode | undefined, logicalId: string) => string;
/**
 * Parse an FQN back into namespace path segments and the logical ID.
 *
 * @example
 * ```ts
 * parseFqn("Parent/Child/MyResource"); // { path: ["Parent", "Child"], logicalId: "MyResource" }
 * parseFqn("MyResource"); // { path: [], logicalId: "MyResource" }
 * ```
 */
export declare const parseFqn: (fqn: string) => {
    path: string[];
    logicalId: string;
};
/**
 * Reconstruct a NamespaceNode chain from a path array.
 *
 * @example
 * ```ts
 * fromPath(["Parent", "Child"]);
 * // { Id: "Child", Parent: { Id: "Parent" } }
 * ```
 */
export declare const fromPath: (path: string[]) => NamespaceNode | undefined;
//# sourceMappingURL=FQN.d.ts.map