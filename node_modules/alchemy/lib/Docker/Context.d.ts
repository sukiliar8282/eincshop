import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { Docker } from "./Docker.ts";
import type { Providers } from "./Providers.ts";
export interface ContextProps {
    /**
     * Context name.
     *
     * @default Generated from stack, stage, logical id, and instance id.
     */
    name?: string;
    /** Human-readable description displayed in `docker context ls`. */
    description?: string;
    /**
     * Docker endpoint spec, for example `host=ssh://user@host`.
     *
     * Connection metadata only — never credentials. SSH endpoints
     * authenticate with keys/agent (Docker rejects passwords in the URL), and
     * TLS endpoints reference cert/key material by file path
     * (`host=tcp://...,ca=...,cert=...,key=...`), not by value. Docker itself
     * stores this spec in plaintext under `~/.docker/contexts`.
     */
    docker?: string;
}
export interface Context extends Resource<"Docker.Context", ContextProps, {
    /** Docker context name (contexts are identified by name). */
    id: string;
    /** Docker context name. */
    name: string;
    /** Human-readable description. */
    description: string;
    /** Docker endpoint the context targets. */
    docker?: string;
}, never, Providers> {
}
/**
 * A named Docker CLI context — a pointer to a Docker engine (local socket,
 * SSH host, or TCP endpoint) that other Docker resources deploy through.
 *
 * Pass the context (or its name) to any Docker resource's `context` prop to
 * run that resource's operations against the referenced engine instead of the
 * default one. Changing the endpoint updates the context in place; renaming
 * it, or clearing a previously-set endpoint, replaces it.
 *
 *
 * ### Creating Contexts
 * **Example:** Remote engine over SSH
 * ```typescript
 * const vps = yield* Docker.Context("vps", {
 *   docker: "host=ssh://deploy@example.com",
 *   description: "production swarm manager",
 * });
 * ```
 *
 * ### Using a Context
 * **Example:** Deploy resources through the context
 * ```typescript
 * const vps = yield* Docker.Context("vps", {
 *   docker: "host=ssh://deploy@example.com",
 * });
 * const network = yield* Docker.Network("app-net", {
 *   context: vps,
 *   driver: "overlay",
 * });
 * const app = yield* Docker.Service("app", {
 *   context: vps,
 *   image: "nginx:alpine",
 *   networks: [network.name],
 * });
 * ```
 *
 * **Example:** Local development vs production
 * ```typescript
 * const dev = yield* Alchemy.ALCHEMY_DEV;
 * const context = yield* Docker.Context("target", {
 *   name: dev ? "local" : "vps",
 *   docker: dev ? undefined : "host=ssh://deploy@example.com",
 * });
 * ```
 *
 * @resource
 */
export declare const Context: import("../Resource.ts").ResourceClass<Context>;
export declare const ContextProvider: () => import("effect/Layer").Layer<Provider.Provider<Context>, never, Docker | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
//# sourceMappingURL=Context.d.ts.map