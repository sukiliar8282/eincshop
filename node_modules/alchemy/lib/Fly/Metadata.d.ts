import * as Effect from "effect/Effect";
import { diffTags, type Tags } from "../Tags.ts";
/**
 * Fly App has no labels. Ownership is stamped onto Machine
 * `config.metadata` (and encoded into Volume/Secret names) as
 * `alchemy.stack` / `alchemy.stage` / `alchemy.id`.
 *
 * Names here are Fly-prefixed so `export *` from this module does not
 * collide with Hetzner Labels or `alchemy/src/Ref.ts`.
 */
export declare const ALCHEMY_METADATA_PREFIX = "alchemy.";
export declare const alchemyMetadataKeys: {
    readonly stack: "alchemy.stack";
    readonly stage: "alchemy.stage";
    readonly id: "alchemy.id";
    readonly type: "alchemy.type";
    readonly replica: "alchemy.replica";
};
export type FlyAlchemyType = "Fly.Machine" | "Fly.Service";
export declare const toMetadataKey: (tagKey: string) => string;
export declare const toTagKeyFromMetadata: (metadataKey: string) => string;
export declare const toMachineMetadata: (tags: Record<string, string> | null | undefined) => Record<string, string>;
export declare const fromMachineMetadata: (metadata: Record<string, string> | null | undefined) => Record<string, string>;
export declare const createInternalMetadata: (id: string) => Effect.Effect<Record<string, string>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
/**
 * Stamp alchemy ownership plus `alchemy.type` onto Machine config.metadata.
 */
export declare const createMachineMetadata: (id: string, type: FlyAlchemyType) => Effect.Effect<{
    "alchemy.type": FlyAlchemyType;
}, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
export declare const stripInternalMetadata: (metadata: Record<string, string> | null | undefined) => Record<string, string>;
export declare const hasAlchemyMetadata: (id: string, metadata: Tags | undefined) => Effect.Effect<boolean, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
/** True when observed Machine metadata was stamped by Alchemy. */
export declare const isAlchemyOwnedMetadata: (metadata: Record<string, string | undefined> | null | undefined) => boolean;
/**
 * Diff observed Machine metadata against desired. Always pass **observed**
 * cloud metadata as `oldMetadata` — never `olds.metadata` or
 * `output.metadata` — so adoption converges.
 */
export declare const diffMachineMetadata: typeof diffTags;
/**
 * Fly App names: `createPhysicalName({ lowercase: true, maxLength: 30 })`,
 * then force a leading letter (`f` prefix if needed). Globally unique.
 */
export declare const createFlyAppName: (id: string) => Effect.Effect<string, never, import("../InstanceId.ts").InstanceId | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
/**
 * Volume / Secret / SecretKey physical names use the same shape as App
 * names so `list()` can recognize alchemy-owned rows without labels.
 *
 * Fly Volume names reject hyphens (`[a-z0-9_]`, max 30). Use
 * {@link createFlyVolumeName} for Volumes.
 */
export declare const createFlyResourceName: (id: string) => Effect.Effect<string, never, import("../InstanceId.ts").InstanceId | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
/**
 * Fly Volume names: same physical-name shape as App, but underscore
 * delimited. Fly rejects hyphens (`[a-z0-9_]`, max 30).
 */
export declare const createFlyVolumeName: (id: string) => Effect.Effect<string, never, import("../InstanceId.ts").InstanceId | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
/**
 * Sanitize a user-supplied Fly App / Volume / Secret name: lowercase,
 * DNS-compatible (`[a-z0-9-]`), force a leading letter, max 30 chars.
 */
export declare const sanitizeFlyAppName: (name: string) => string;
/**
 * Sanitize a user-supplied Fly Volume name: lowercase alphanumeric and
 * underscores only, force a leading letter, max 30 chars.
 */
export declare const sanitizeFlyVolumeName: (name: string) => string;
/**
 * True when `name` matches the `createPhysicalName` + leading-letter shape
 * used for alchemy-owned Fly Apps / Volumes / Secrets / SecretKeys.
 *
 * Untruncated names end with a hyphen (App) or underscore (Volume) plus
 * an 8–16 char RFC4648 base32 instance suffix. Truncated 30-char names
 * keep that suffix (the human prefix is what gets cut).
 */
export declare const matchesAlchemyPhysicalName: (name: string | undefined) => boolean;
//# sourceMappingURL=Metadata.d.ts.map