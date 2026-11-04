/**
 * Compute the strongly-connected components of a directed graph.
 *
 * Components are emitted in Tarjan completion order — the reverse
 * topological order of the condensation, so a component appears before
 * every component that has an edge into it.
 *
 * Implementation is iterative Tarjan's algorithm to avoid blowing the JS
 * call stack on very wide graphs.
 */
export declare const stronglyConnectedComponents: (nodes: Iterable<string>, successors: (node: string) => Iterable<string>) => string[][];
/**
 * Compute the set of graph nodes that participate in a dependency cycle.
 *
 * A node is considered "in a cycle" iff it sits in a strongly-connected
 * component (SCC) of size > 1, or has a self-edge (size-1 SCC that loops
 * back to itself).
 */
export declare const findCycleMembers: (edges: Record<string, readonly string[]>) => Set<string>;
//# sourceMappingURL=scc.d.ts.map