/**
 * Resolve the bundled program (the runners registered via `host.run` /
 * serve) and run it with a Bun HTTP server bound to `PORT`, so a returned
 * `{ fetch }` handler is actually served and `host.run` loops stay alive. A
 * pure one-shot `{ run }` program completes and the process exits 0.
 */
export declare const bootstrap: (entrypoint: unknown) => Promise<void>;
//# sourceMappingURL=Ecs.d.ts.map