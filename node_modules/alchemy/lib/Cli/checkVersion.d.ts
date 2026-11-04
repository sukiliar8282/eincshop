import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as HttpClient from "effect/unstable/http/HttpClient";
import { AlchemyContext } from "alchemy/AlchemyContext";
/**
 * Semver precedence (semver.org §11): negative when a < b, positive when
 * a > b. Enough of the spec for registry versions — numeric core, dotted
 * prerelease identifiers, release > prerelease.
 */
declare const compareVersions: (a: string, b: string) => number;
/**
 * Pick the dist-tag matching the current channel. For pre-release versions
 * like `2.0.0-beta.33`, we match the prerelease identifier (`beta`, `next`,
 * etc.), falling back through `next` → `latest`. Because our releases can
 * force prereleases onto `latest`, it may run ahead of the channel tag —
 * in that case offer `latest` instead of the channel pick.
 */
declare const pickDistTag: (current: string, distTags: Record<string, string>) => string | undefined;
/**
 * Warn if a newer `alchemy` version is published on the dist-tag matching
 * the current channel. Runs to completion before any interactive prompts so
 * the warning never interleaves with prompt rendering, and is bounded so it
 * can never stall the CLI: dist-tags are cached in
 * `.alchemy/version-check.json` for a day (failed attempts included), so at
 * most one run per day waits on the network, and only up to
 * {@link SYNC_WAIT}. Best-effort: every failure is swallowed silently.
 */
export declare const checkLatestVersion: Effect.Effect<void, never, AlchemyContext | FileSystem.FileSystem | HttpClient.HttpClient | Path.Path | import("effect/Scope").Scope>;
export declare const _internal: {
    pickDistTag: typeof pickDistTag;
    compareVersions: typeof compareVersions;
};
export {};
//# sourceMappingURL=checkVersion.d.ts.map