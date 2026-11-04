import { createHash } from "node:crypto";
import * as Effect from "effect/Effect";
import { base32 } from ".//Util/base32.js";
import { InstanceId } from "./InstanceId.js";
import { Stack } from "./Stack.js";
import { Stage } from "./Stage.js";
// 8 base32 chars = 40 bits of the sha256 of the full untruncated name,
// appended when truncation occurs so names that differ only in the truncated
// portion of the prefix stay distinct.
const TRUNCATION_HASH_LENGTH = 8;
export const createPhysicalName = Effect.fn(function* ({ id, prefix: _prefix, 
// 16 base32 characters = 80 bits of entropy = 4 × 10⁻⁷
instanceId, suffixLength = 16, maxLength = 64, delimiter = "-", lowercase = false, forbiddenPrefixes = [], }) {
    // Always generate DNS-compatible names (letters, numbers, and hyphens only).
    // This ensures physical names work across all services including S3 buckets.
    const sanitize = (name) => (lowercase ? name.toLowerCase() : name).replaceAll(lowercase ? /[^a-z0-9-]/g : /[^a-zA-Z0-9-]/g, delimiter);
    const stack = yield* Stack;
    const stage = yield* Stage;
    let prefix = _prefix ?? `${stack.name}${delimiter}${id}${delimiter}${stage}${delimiter}`;
    if (forbiddenPrefixes.some((forbidden) => prefix.toLowerCase().startsWith(forbidden.toLowerCase()))) {
        prefix = `x${delimiter}${prefix}`;
    }
    const randomId = base32(Buffer.from(instanceId ?? (yield* InstanceId), "hex"));
    const suffix = randomId.slice(0, suffixLength);
    const name = `${prefix}${suffix}`;
    if (maxLength && name.length > maxLength) {
        // The instance suffix alone cannot disambiguate: every name derived from
        // the same resource shares one InstanceId, so two prefixes that differ
        // only in their truncated tail (e.g. `…-task-role-` vs `…-execution-role-`)
        // would collapse to the same string. Keep a stable hash of the full name
        // next to the suffix so truncated names remain unique.
        const hash = yield* Effect.sync(() => base32(createHash("sha256").update(name).digest()).slice(0, TRUNCATION_HASH_LENGTH));
        // The hash is what keeps same-resource names distinct, so it always
        // survives in full; when maxLength is tight (e.g. DAX's 20-char limit)
        // the instance suffix shrinks instead — 12 base32 chars still carry 60
        // bits of instance entropy.
        const tail = `${hash}${suffix}`.slice(0, maxLength);
        return sanitize(`${prefix.slice(0, Math.max(0, maxLength - tail.length))}${tail}`);
    }
    return sanitize(name);
});
//# sourceMappingURL=PhysicalName.js.map