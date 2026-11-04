import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import type { ExtraFile } from "../Util/extraFiles.ts";
/**
 * Extra files baked into a container/unit next to the Node serve entry.
 *
 * - `"client"`: the build's dist directory at the image/unit root.
 * - `"next"`: `.next`, `public/`, and `next.config.*` from `from` (the
 *   Next.js app root — for the node target that is also `distDirectory`).
 */
export declare const packSiteExtraFiles: (from: string, mode: "client" | "next") => Effect.Effect<ExtraFile[] | undefined, never, FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=packExtraFiles.d.ts.map