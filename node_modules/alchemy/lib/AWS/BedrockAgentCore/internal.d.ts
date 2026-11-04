import * as control from "@distilled.cloud/aws/bedrock-agentcore-control";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
declare const AgentCoreProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AgentCoreProvisioningFailed";
} & Readonly<A>;
/**
 * Raised when an AgentCore resource lands in a terminal failure state
 * (`FAILED`, `CREATE_FAILED`, `UPDATE_FAILED`) during reconciliation.
 */
export declare class AgentCoreProvisioningFailed extends AgentCoreProvisioningFailed_base<{
    message: string;
}> {
}
/**
 * Unwrap an AgentCore `SensitiveString` (decoded as `Redacted`) to its plain
 * string value. `String(redacted)` would yield `"<redacted>"`, not the value.
 */
export declare const unredact: (value: string | Redacted.Redacted<string> | undefined) => string | undefined;
/**
 * AgentCore Memory / Runtime / CodeInterpreter / Browser names must match
 * `[a-zA-Z][a-zA-Z0-9_]{0,47}` — underscores, no hyphens. Derive a
 * deterministic physical name and swap hyphens for underscores.
 */
export declare const createAgentCoreName: (id: string) => Effect.Effect<string, never, import("../../InstanceId.ts").InstanceId | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
/**
 * Gateway names must match `([0-9a-zA-Z][-]?){1,48}` — hyphens allowed but
 * never consecutive, no underscores. Collapse runs of hyphens.
 */
export declare const createGatewayName: (id: string) => Effect.Effect<string, never, import("../../InstanceId.ts").InstanceId | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
/**
 * Read the observed tags of an AgentCore resource by ARN. Best-effort — a
 * failure (e.g. a race with deletion) reports no tags.
 */
export declare const readAgentCoreTags: (resourceArn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on an AgentCore resource: diff the OBSERVED cloud tags against
 * the desired set and apply only the delta.
 */
export declare const syncAgentCoreTags: (resourceArn: string, desired: Record<string, string>) => Effect.Effect<void, control.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Bounded retry through transient `ConflictException`s (e.g. deleting a
 * gateway whose targets are still tearing down, or mutating a resource that
 * is mid-transition). Explicitly typed so the conditional `Retry.Return`
 * type never widens the provider layer's requirements in declaration emit.
 */
export declare const retryWhileConflict: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Bounded retry through `ValidationException` during create — a freshly
 * created IAM role referenced by `roleArn` is not instantly assumable by the
 * AgentCore service principal (IAM eventual consistency).
 */
export declare const retryWhileValidation: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
export {};
//# sourceMappingURL=internal.d.ts.map