/**
 * Build the sandbox-lifetime layer stack and return the Lambda handler the
 * bundled function registered.
 *
 * The layer build lives under an instance scope (not a transient
 * `Effect.provide`/`Effect.scoped` region) so services and init-level
 * finalizers live for the sandbox and are released at Shutdown — Lambda's
 * SIGTERM phase, which the internal extension registered here buys us
 * (without any registered extension the sandbox is killed with no signal at
 * all). Each invocation still gets its own request scope from the handler
 * dispatch.
 */
export declare const bootstrap: (entrypoint: unknown) => Promise<unknown>;
//# sourceMappingURL=Lambda.d.ts.map