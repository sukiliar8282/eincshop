import * as Effect from "effect/Effect";
import { InstanceId } from "./InstanceId.ts";
import { Stack } from "./Stack.ts";
import { Stage } from "./Stage.ts";
export declare const createPhysicalName: (args_0: {
    id: string;
    /**
     * Prefix to add to the physical name.
     *
     * @default ${app.name}-${sanitizedId}-${app.stage}-
     */
    prefix?: string;
    /**
     * Hex-encoded instance ID (16 random bytes)
     *
     * @default - the InstanceID set by the engine in Context
     */
    instanceId?: string;
    suffixLength?: number;
    /**
     * Maximum length of the physical name.
     *
     * If the name exceeds this length, the human-friendly prefix is truncated
     * and a stable hash of the full name is kept alongside the instance suffix
     * so distinct names never collapse to the same truncated string.
     */
    maxLength?: number;
    /** @default - "-" */
    delimiter?: string;
    /** Whether to lowercase the physical name. @default false */
    lowercase?: boolean;
    /**
     * Service-reserved name prefixes (matched case-insensitively). When the
     * generated prefix would start with one of these — e.g. a stack named
     * `aws-*` colliding with S3 Tables' reserved `aws` bucket prefix — a safe
     * `x${delimiter}` is prepended so the name stays valid. Names that don't
     * collide are unaffected, so existing deployments never rename.
     */
    forbiddenPrefixes?: string[];
}) => Effect.Effect<string, never, InstanceId | Stack | Stage>;
//# sourceMappingURL=PhysicalName.d.ts.map