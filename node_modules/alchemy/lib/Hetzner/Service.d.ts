import { Services } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
import { Platform, type Main, type PlatformProps } from "../Platform.ts";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { ServerHost } from "../Server/Process.ts";
import { Stack } from "../Stack.ts";
import type { ServiceBinding } from "./MountVolume.ts";
import type { Providers } from "./Providers.ts";
import type { Server } from "./Server.ts";
import { type HetznerBuildOptions, type HetznerHostRuntimeContext } from "./hosted.ts";
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* Server(...)` and `Server(...)` both type-check).
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
export interface ServiceProps extends PlatformProps {
    /**
     * Server this Service runs on. Accepts a `Hetzner.Server` or an Effect
     * that produces one. Changing the Server replaces the Service.
     */
    server: Ref<Server>;
    /**
     * Module entrypoint bundled with rolldown and copied onto the Server
     * over SSH as a systemd unit.
     */
    main: string;
    /**
     * Port the hosted HTTP server listens on. Written to `PORT` and used
     * to build {@link Service} `url`.
     *
     * @default 3000
     */
    port?: number;
    /**
     * Named export to load from `main`.
     *
     * @default "default"
     */
    handler?: string;
    /**
     * Additional environment variables for the hosted process. Merged after
     * binding-injected `env`.
     */
    env?: Record<string, any>;
    /**
     * Bundler configuration for `main`: rolldown `input`/`output` overrides
     * plus pure-annotation options (`pure`) and `install` for packages that
     * must ship as real `node_modules` (see {@link HetznerBuildOptions}).
     */
    build?: HetznerBuildOptions;
    /**
     * Extra host directories packed into the unit archive next to the
     * bundled entry (e.g. a website `clientDirectory` at `dist/`). Hashed
     * into `code.hash` so asset changes update the unit. Destination is
     * relative to the unit root (`/opt/<unit>/`).
     */
    extraFiles?: ReadonlyArray<{
        source: string;
        destination: string;
    }>;
}
export type Service = Resource<"Hetzner.Service", ServiceProps, {
    /** Numeric Hetzner Server ID the unit runs on. */
    serverId: number;
    /** Public IPv4 of the Server, if attached. */
    ipv4: string | undefined;
    /** Port the process listens on. */
    port: number;
    /** `http://<ipv4>:<port>` when the Server has a public IPv4. */
    url: string | undefined;
    /** systemd unit name (`<name>.service`). */
    unitName: string;
    /** Content hash of the bundled program. */
    code: {
        hash: string;
    };
}, ServiceBinding, Providers>;
export declare const isService: (value: unknown) => value is Service;
export type ServiceServices = ServerHost;
export type ServiceShape = Main<ServiceServices>;
export type ServiceRuntimeContext = HetznerHostRuntimeContext;
/**
 * An Effect program hosted on a Hetzner Cloud Server as a systemd unit.
 *
 * N Services can share one Server. Each Service is bundled with rolldown,
 * copied over SSH, and restarted as its own unit. Bind
 * `Hetzner.MountVolume` inside the impl to attach a Volume and mount it
 * at a path — the same `(volume, server, path)` from two Services is one
 * attach and one mount.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#servers
 *
 * ### Hosting a Service
 * **Example:** HTTP server on a Server
 * ```typescript
 * const server = yield* Hetzner.Server("box", {
 *   serverType: "cpx12",
 *   image: "ubuntu-24.04",
 *   location: "nbg1",
 * });
 *
 * export default class Api extends Hetzner.Service<Api>()(
 *   "Api",
 *   { server, main: import.meta.url, port: 3000 },
 *   Effect.gen(function* () {
 *     return {
 *       fetch: Effect.succeed(HttpServerResponse.json({ ok: true })),
 *     };
 *   }),
 * ) {}
 * ```
 *
 * ### Volumes
 * **Example:** Mount a Volume
 * ```typescript
 * const mount = yield* Hetzner.MountVolume(volume, { path: "/data" });
 * // write/read files under mount.path inside the hosted process
 * ```
 *
 * @resource
 */
export declare const Service: Platform<Service, ServiceServices, ServiceShape, ServiceRuntimeContext>;
declare const ServiceError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.ServiceError";
} & Readonly<A>;
export declare class ServiceError extends ServiceError_base<{
    message: string;
}> {
}
export declare const ServiceProvider: () => import("effect/Layer").Layer<Provider.Provider<Service>, never, Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext | import("./Ssh.ts").SshServices>;
export {};
//# sourceMappingURL=Service.d.ts.map