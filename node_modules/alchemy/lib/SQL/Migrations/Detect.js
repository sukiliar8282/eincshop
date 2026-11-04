import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import { DrizzleV0LayoutError } from "./Format.js";
import { DRIZZLE_DIR_PATTERN } from "./Records.js";
/**
 * Fingerprint a migrations directory's layout to pick the record reader.
 *
 * A drizzle **v0** layout (`meta/_journal.json`) fails with a typed error:
 * the fix (`drizzle-kit up`) is upstream of Alchemy.
 */
export const detectLayout = (dir) => Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const exists = (p) => fs.exists(p).pipe(Effect.catch(() => Effect.succeed(false)));
    if (yield* exists(path.join(dir, "meta", "_journal.json"))) {
        return yield* new DrizzleV0LayoutError({
            dir,
            message: `${dir} uses drizzle-kit's pre-v1 migration layout (meta/_journal.json). ` +
                `Upgrade drizzle-kit and run "drizzle-kit up" to convert it, then redeploy.`,
        });
    }
    const entries = yield* fs
        .readDirectory(dir)
        .pipe(Effect.catch(() => Effect.succeed([])));
    for (const entry of entries) {
        if (!DRIZZLE_DIR_PATTERN.test(entry))
            continue;
        if (yield* exists(path.join(dir, entry, "migration.sql"))) {
            return "directory";
        }
    }
    return "flat";
});
//# sourceMappingURL=Detect.js.map