import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { Stage } from "../Stage.ts";
import { CommandExecutor, type CommandProps } from "./Command.ts";
export interface DevProps extends CommandProps {
}
export interface Dev extends Resource<"Command.Dev", DevProps, {
    /**
     * URL extracted from stdout/stderr. A `localhost`/IP URL (the dev
     * server's own address) is preferred over any other URL the command
     * prints; a non-local URL is only used as a fallback if no local one
     * appears. Best-effort: `undefined` if no URL appears within 5 seconds.
     */
    url: string | undefined;
}> {
}
/**
 * A long-lived shell process scoped to a stack instance, started during
 * `alchemy dev` and restarted when its inputs change. During `alchemy deploy`
 * this is a no-op — `Dev` resources only run in dev mode.
 *
 * The child process runs inside the dev sidecar (see `Command/Local.ts`) so it
 * survives user-code HMR — Alchemy's user process can restart without killing
 * your `npm run dev` server. Its stdout/stderr are mirrored to the terminal
 * (preserving colored output) and scanned for an `http(s)://…` URL, favoring
 * a `localhost`/IP URL (the dev server's own address) over any unrelated URL
 * the command prints first. The result is exposed as the `url` output
 * attribute — useful for surfacing a dev server's local URL back out to
 * whatever resource declared this `Dev`.
 *
 *
 * ### Basic Usage
 * Pass a shell command that starts a long-lived dev server. Alchemy
 * runs it in the background and extracts the first URL it prints.
 *
 * **Example:** Start a Vite dev server
 * ```typescript
 * const dev = yield* Dev("Frontend", {
 *   command: "npm run dev",
 * });
 * yield* Console.log(dev.url); // e.g. "http://localhost:5173"
 * ```
 *
 * ### Working Directory
 * Use `cwd` to run the command in a subdirectory — useful in
 * monorepos where each package has its own dev server.
 *
 * **Example:** Monorepo package
 * ```typescript
 * const dev = yield* Dev("Web", {
 *   command: "npm run dev",
 *   cwd: "apps/web",
 * });
 * ```
 *
 * ### Environment Variables
 * Extra environment variables are merged on top of `process.env`.
 * Sensitive values can be wrapped in `Redacted` to keep them out
 * of logs and state files.
 *
 * **Example:** Custom port and env
 * ```typescript
 * const dev = yield* Dev("Api", {
 *   command: "npm run dev",
 *   env: {
 *     PORT: "4000",
 *     DATABASE_URL: Redacted.make("postgres://..."),
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Dev: import("../Resource.ts").ResourceClass<Dev>;
export declare const DevProvider: () => import("effect/Layer").Layer<Provider.Provider<Dev>, never, import("../AlchemyContext.ts").AlchemyContext | import("../Artifacts.ts").ArtifactStore | CommandExecutor | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../Stack.ts").Stack | Stage>;
export declare const DevProviderLive: () => import("effect/Layer").Layer<Provider.Provider<Dev>, never, never>;
export declare const DevProviderLocal: () => import("effect/Layer").Layer<Provider.Provider<Dev>, never, import("../AlchemyContext.ts").AlchemyContext | import("../Artifacts.ts").ArtifactStore | CommandExecutor | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../Stack.ts").Stack | Stage>;
/**
 * Extract a URL from `text`, favoring a localhost/IP URL (the dev server's
 * own address) over any other URL. Returns the first localhost/IP URL if one
 * is present, otherwise the first plain http(s) URL, otherwise `undefined`.
 * `Vite`, `Next`, etc. surround the URL with ANSI color codes that would
 * otherwise be eaten by the URL regex, so strip them first.
 * @internal
 */
export declare const extractUrl: (text: string) => string | undefined;
//# sourceMappingURL=Dev.d.ts.map