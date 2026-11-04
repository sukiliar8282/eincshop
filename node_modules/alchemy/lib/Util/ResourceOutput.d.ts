import type * as ConsoleService from "effect/Console";
import * as Effect from "effect/Effect";
export type OutputChannel = "stdout" | "stderr";
/** Sigil-themed resource attribution shared by every append-only log path. */
export declare const formatResourceTag: (id: string, colors?: boolean) => string;
/** Remove a pretty Effect prefix already rendered by a child process. */
export declare const stripChildEffectPrefix: (line: string) => string;
/**
 * The single terminal-output pipeline for resource-owned processes. Dev
 * servers, local workers, and deploy-time builders all use the same line
 * splitting, resource prefix, color policy, and stdout/stderr severity.
 */
export declare const makeResourceOutput: (id: string, console: Pick<ConsoleService.Console, "log">) => {
    stdout: {
        push(chunk: string): void;
        flush(): void;
    };
    stderr: {
        push(chunk: string): void;
        flush(): void;
    };
};
/**
 * Effect-native output for resource-owned child processes whose streams are
 * already consumed inside an Effect. Both process channels are transport
 * details, not semantic severity, so they enter the configured logger at the
 * info level. The logger remains responsible for terminal and file sinks.
 */
export declare const makeResourceLogger: (id: string) => (_channel: OutputChannel, line: string) => Effect.Effect<void, never, never>;
//# sourceMappingURL=ResourceOutput.d.ts.map