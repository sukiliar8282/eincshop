import type { Crypto } from "effect/Crypto";
import type { Input as DurationInput } from "effect/Duration";
import * as Effect from "effect/Effect";
import type { FileSystem } from "effect/FileSystem";
import * as Layer from "effect/Layer";
import type { Path } from "effect/Path";
import { type Teardown } from "effect/Runtime";
import type { Stdio } from "effect/Stdio";
import type { Terminal } from "effect/Terminal";
import type { HttpServer } from "effect/unstable/http/HttpServer";
import type { ServeError } from "effect/unstable/http/HttpServerError";
import type { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner";
import type { WebSocketConstructor } from "effect/unstable/socket/Socket";
/**
 * Constructs a layer with different implementations for Bun and Node.
 */
export declare const platformLayer: <A, E, R>(constructors: {
    bun: () => Promise<Layer.Layer<A, E, R>>;
    node: () => Promise<Layer.Layer<A, E, R>>;
}) => Layer.Layer<A, E, R>;
export type PlatformServices = ChildProcessSpawner | Crypto | FileSystem | Path | Stdio | Terminal | WebSocketConstructor;
export declare const PlatformServices: Layer.Layer<PlatformServices>;
export declare const runMain: <E, A>(effect: Effect.Effect<A, E>, options?: {
    readonly disableErrorReporting?: boolean | undefined;
    readonly teardown?: Teardown | undefined;
}) => void;
export declare const httpServer: (port?: number, host?: string, options?: {
    readonly gracefulShutdownTimeout?: DurationInput | undefined;
}) => Layer.Layer<HttpServer, ServeError>;
//# sourceMappingURL=PlatformServices.d.ts.map