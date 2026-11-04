import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import { AlchemyContext } from "../AlchemyContext.ts";
/**
 * Resolves the directory a resource's dev logs land in, for surfacing in
 * startup messages ("Started … → url (logs: …)") without opening a file.
 * Must join the same segments the opener is later called with.
 */
export declare const makeDevLogDirectory: Effect.Effect<(...segments: ReadonlyArray<string>) => string, never, AlchemyContext | Path.Path>;
/**
 * Resolves the file-system services once (at provider/process init) and
 * returns an opener whose only requirement is the ambient `Scope` — local
 * provider `start` signatures are Scope-only, so the opener composes into
 * them without widening their requirements.
 *
 * The opener creates `{dotAlchemy}/log/{...segments}/{timestamp}.log`
 * (pruning stale siblings per the module retention policy first) and
 * returns the file's `path` plus synchronous `write`/`writeLine` sinks —
 * chunks queue through a drain fiber, so they're safe to call from
 * non-Effect callbacks (workerd output pumps, stream mirrors). The file and
 * drain close with the scope, which ties one log file to one
 * process/serve generation.
 */
export declare const makeDevLogOpener: Effect.Effect<(...args: any[]) => Effect.Effect<{
    /** Absolute path of this generation's log file. */
    path: string;
    write: (chunk: string) => void;
    /** `write` + a trailing newline — for line-based sources. */
    writeLine: (line: string) => void;
}, import("effect/PlatformError").PlatformError, import("effect/Scope").Scope>, never, AlchemyContext | FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=DevLog.d.ts.map