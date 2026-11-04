import type * as iam from "@distilled.cloud/aws/iam";
import * as Redacted from "effect/Redacted";
import type { PolicyDocument } from "./Policy.ts";
/**
 * Convert an optional `Duration.Input` prop to whole wire seconds.
 *
 * @deprecated Import {@link toWireSeconds} from `Util/Duration.ts` directly.
 * Kept as an alias because several other AWS services still import it from
 * here.
 */
export declare const durationToSeconds: (input: import("effect/Duration").Input | undefined) => number | undefined;
/**
 * Convert an optional `Duration.Input` prop to whole wire days.
 *
 * @deprecated Import {@link toWireDays} from `Util/Duration.ts` directly.
 * Kept as an alias because several other AWS services still import it from
 * here.
 */
export declare const durationToDays: (input: import("effect/Duration").Input | undefined) => number | undefined;
export declare const toTagRecord: (tags: Array<{
    Key?: string;
    Value?: string;
}> | undefined) => Record<string, string>;
export declare const parsePolicyDocument: (value: string | undefined) => PolicyDocument | undefined;
export declare const stringifyPolicyDocument: (value: PolicyDocument) => string;
export declare const normalizeIamPath: (value: string | undefined) => string;
export declare const policyArnFromParts: ({ accountId, path, policyName, }: {
    accountId: string;
    path: string | undefined;
    policyName: string;
}) => string;
export declare const oldestNondefaultPolicyVersion: (versions: iam.PolicyVersion[] | undefined) => iam.PolicyVersion;
export declare const toRedactedString: (value: string | Redacted.Redacted<string> | undefined) => Redacted.Redacted<string> | undefined;
export declare const toRedactedBytes: (value: Uint8Array<ArrayBufferLike> | Redacted.Redacted<Uint8Array<ArrayBufferLike>> | undefined) => Redacted.Redacted<Uint8Array<ArrayBufferLike>> | undefined;
export declare const unwrapRedactedString: (value: string | Redacted.Redacted<string>) => string;
//# sourceMappingURL=common.d.ts.map