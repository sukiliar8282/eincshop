import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import { DrizzleV0LayoutError } from "./Format.ts";
/**
 * The on-disk layout of a migrations directory. `directory` covers both
 * drizzle-kit v1 and Prisma layouts (`<ts>_<name>/migration.sql` — records
 * key by directory name); `flat` is plain `.sql` files (records key by file
 * path).
 */
export type MigrationLayout = "directory" | "flat";
/**
 * Fingerprint a migrations directory's layout to pick the record reader.
 *
 * A drizzle **v0** layout (`meta/_journal.json`) fails with a typed error:
 * the fix (`drizzle-kit up`) is upstream of Alchemy.
 */
export declare const detectLayout: (dir: string) => Effect.Effect<"directory" | "flat", DrizzleV0LayoutError, FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=Detect.d.ts.map