import * as Effect from "effect/Effect";
/**
 * Railway has no labels. Ownership is stamped into the physical name via
 * `createPhysicalName` (lowercase, max 32, leading letter). Railway's
 * `projectCreate` rejects longer generated names (`Invalid project name`).
 * `list()` filters with {@link matchesAlchemyPhysicalName} so nuke does
 * not enumerate the whole workspace.
 */
export declare const RAILWAY_NAME_MAX_LENGTH = 32;
/**
 * Railway generates `{serviceName}-{environmentName}.up.railway.app` on
 * `serviceDomainCreate`. That first DNS label must be ≤ 63 characters
 * (`32 + 1 + 32 = 65` fails with "please try again"). Extra environments
 * stay shorter so a 32-char service name still fits.
 */
export declare const RAILWAY_ENVIRONMENT_NAME_MAX_LENGTH = 24;
/**
 * Railway Project / Service / Volume / Variable physical names:
 * `createPhysicalName({ lowercase: true, maxLength: 32 })`, then force a
 * leading letter (`r` prefix if needed). Unique per workspace.
 */
export declare const createRailwayName: (id: string) => Effect.Effect<string, never, import("../InstanceId.ts").InstanceId | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
/** Extra-environment names. See {@link RAILWAY_ENVIRONMENT_NAME_MAX_LENGTH}. */
export declare const createRailwayEnvironmentName: (id: string) => Effect.Effect<string, never, import("../InstanceId.ts").InstanceId | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
export declare const sanitizeRailwayName: (name: string) => string;
export declare const sanitizeRailwayEnvironmentName: (name: string) => string;
export declare const sanitize: typeof sanitizeRailwayName;
/**
 * True when `name` matches the `createPhysicalName` + leading-letter shape
 * used for alchemy-owned Railway resources.
 *
 * Untruncated names end with a hyphen plus an 8–16 char RFC4648 base32
 * instance suffix. Truncated 32-char names keep that suffix (the human
 * prefix is what gets cut).
 */
export declare const matchesAlchemyPhysicalName: (name: string | undefined) => boolean;
//# sourceMappingURL=Metadata.d.ts.map