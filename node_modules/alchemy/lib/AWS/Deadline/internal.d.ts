import * as logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as deadline from "@distilled.cloud/aws/deadline";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { AWSEnvironment } from "../Environment.ts";
/**
 * Unwrap distilled `SensitiveString` values (`string | Redacted<string>`)
 * to a plain string for drift comparison.
 */
export declare const asPlain: (value: string | Redacted.Redacted<string> | undefined) => string | undefined;
/**
 * Build a Deadline Cloud ARN factory bound to the ambient account/region.
 * Paths look like `farm/{farmId}`, `farm/{farmId}/queue/{queueId}`,
 * `monitor/{monitorId}`.
 */
export declare const deadlineArnOf: Effect.Effect<(path: string) => string, never, AWSEnvironment>;
/**
 * Read the observed tags of a Deadline resource. A missing resource (or a
 * resource type without tag support) reads as an empty tag set.
 */
export declare const fetchDeadlineTags: (arn: string) => Effect.Effect<{
    [k: string]: string;
}, deadline.AccessDeniedException | deadline.InternalServerErrorException | deadline.ThrottlingException | deadline.ValidationException | import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Converge a Deadline resource's tags to the desired set, diffing against
 * the OBSERVED cloud tags (never olds/output).
 */
export declare const syncDeadlineTags: (arn: string, desired: Record<string, string>) => Effect.Effect<void, deadline.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Deadline auto-creates CloudWatch log groups under
 * `/aws/deadline/{farmId}/{queueId}` (queue job/session logs) and
 * `/aws/deadline/{farmId}/{fleetId}/...` (fleet worker logs), and neither
 * `deleteQueue` nor `deleteFarm` removes them — without this reap every
 * deleted farm strands orphaned log groups. Idempotent: a group already
 * gone (or never created) is not an error.
 */
export declare const reapDeadlineLogGroups: (prefix: string) => Effect.Effect<void, logs.InvalidParameterException | logs.OperationAbortedException | logs.ServiceUnavailableException | logs.ValidationException | import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Reap every child resource of a farm so `deleteFarm` can succeed. A normal
 * stack destroy deletes children before the farm, so this observes nothing —
 * but an orphan sweep (nuke) or a mid-run crash can leave a farm whose
 * children were never enumerated, and `deleteFarm` then rejects with
 * `ConflictException` ("This farm still contains some storage profiles /
 * queues / fleets ...") until the retry budget runs out and the farm leaks.
 *
 * Order matters: queue-fleet/queue-limit associations must be stopped and
 * deleted before their queues/fleets/limits; storage profiles may be
 * referenced by queues (`allowedStorageProfileIds`) so they go after the
 * queues. Every step is idempotent — a child already gone is not an error.
 */
export declare const reapFarmChildren: (farmId: string) => Effect.Effect<void, deadline.AccessDeniedException | deadline.ConflictException | deadline.InternalServerErrorException | deadline.ThrottlingException | deadline.ValidationException | import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Retry through Deadline `ConflictException` (STATUS_CONFLICT while a
 * sub-resource drains or a concurrent mutation settles). Bounded.
 */
export declare const retryWhileConflict: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * A freshly-created farm rejects sub-resource mutations for a short window:
 * "Farm ... infrastructure setup in progress" surfaces as a 429
 * `ThrottlingException` or a `ConflictException`, and the farm's internal
 * components (e.g. its BudgetTracker) surface as `ResourceNotFoundException`
 * before they are provisioned. Bounded retry through the settling window
 * (~60s). Genuine throttling is also safely absorbed here.
 */
export declare const retryWhileFarmSettling: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * A freshly-created IAM role may not have propagated when Deadline validates
 * it — createFleet/createMonitor surface this as AccessDeniedException.
 * Bounded retry through the propagation window (~60s).
 */
export declare const retryThroughIamPropagation: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
//# sourceMappingURL=internal.d.ts.map