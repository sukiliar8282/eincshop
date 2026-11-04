import * as Lambda from "@distilled.cloud/aws/lambda";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A Lambda permission that grants an AWS service or another account permission to
 * invoke a function.
 * ### Granting Permissions
 * **Example:** S3 Notification Permission
 * ```typescript
 * const perm = yield* Permission("S3Invoke", {
 *   action: "lambda:InvokeFunction",
 *   functionName: yield* fn.functionArn(),
 *   principal: "s3.amazonaws.com",
 *   sourceArn: yield* bucket.bucketArn,
 *   sourceAccount: (yield* AWSEnvironment.current).accountId,
 * });
 * ```
 *
 * **Example:** Cross Account Invoke
 * ```typescript
 * const perm = yield* Permission("CrossAccount", {
 *   action: "lambda:InvokeFunction",
 *   functionName: yield* fn.functionArn(),
 *   principal: "123456789012",
 * });
 * ```
 *
 * **Example:** Public Function URL
 * ```typescript
 * const perm = yield* Permission("PublicUrl", {
 *   action: "lambda:InvokeFunctionUrl",
 *   functionName: yield* fn.functionArn(),
 *   principal: "*",
 *   functionUrlAuthType: "NONE",
 * });
 * ```
 *
 * @resource
 */
export const Permission = Resource("AWS.Lambda.Permission");
export const PermissionProvider = () => Provider.effect(Permission, Effect.gen(function* () {
    const createStatementId = (id) => createPhysicalName({
        id,
        maxLength: 100,
        delimiter: "-",
    });
    const retryPolicyMutation = {
        while: (error) => error._tag === "ResourceConflictException",
        schedule: Schedule.spaced("500 millis"),
        times: 8,
    };
    const addPermission = (request) => Lambda.addPermission(request).pipe(Effect.retry(retryPolicyMutation));
    const removePermission = (request) => Lambda.removePermission(request).pipe(Effect.retry(retryPolicyMutation));
    const hasStatement = Effect.fn(function* (functionName, statementId) {
        const { Policy } = yield* Lambda.getPolicy({
            FunctionName: functionName,
        }).pipe(
        // A function without a resource policy is reported as not found.
        Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({ Policy: undefined })));
        if (!Policy)
            return false;
        return yield* Effect.try({
            try: () => {
                const policy = JSON.parse(Policy);
                const statements = Array.isArray(policy.Statement)
                    ? policy.Statement
                    : policy.Statement
                        ? [policy.Statement]
                        : [];
                return statements.some((statement) => statement.Sid === statementId);
            },
            catch: (cause) => new Error("invalid Lambda resource policy", { cause }),
        });
    });
    return {
        stables: ["statementId", "functionName"],
        list: () => Effect.gen(function* () {
            // Lambda has no list-permissions API. A Permission is a single
            // statement (Sid) inside a function's resource policy, so we fan
            // out: enumerate every function in the ambient account/region
            // (paginated listFunctions), getPolicy per function, parse the
            // policy JSON, and emit one Attributes per statement Sid.
            const functionNames = yield* Lambda.listFunctions.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.Functions ?? [])
                .map((fn) => fn.FunctionName)
                .filter((name) => name != null))));
            const perFunction = yield* Effect.forEach(functionNames, (functionName) => Effect.gen(function* () {
                const { Policy } = yield* Lambda.getPolicy({
                    FunctionName: functionName,
                });
                if (!Policy)
                    return [];
                const policy = yield* Effect.try({
                    try: () => JSON.parse(Policy),
                    catch: (cause) => new Error("invalid policy", { cause }),
                }).pipe(
                // A malformed/non-JSON policy yields no permissions
                // rather than failing the whole enumeration.
                Effect.orElseSucceed(() => ({
                    Statement: [],
                })));
                const statements = Array.isArray(policy.Statement)
                    ? policy.Statement
                    : policy.Statement
                        ? [policy.Statement]
                        : [];
                return statements
                    .filter((s) => typeof s.Sid === "string")
                    .map((s) => ({
                    statementId: s.Sid,
                    functionName,
                }));
            }).pipe(
            // Functions with no resource policy / removed out of band
            // between list and getPolicy — skip them.
            Effect.catchTag("ResourceNotFoundException", () => Effect.succeed([]))), { concurrency: 10 });
            return perFunction.flat();
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            if (news.functionName !== olds.functionName) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            // Observe — derive identity. The statementId is deterministic from
            // the logical id, so we always use it whether this is a first
            // reconciliation, an adoption, or a re-run after a partial create.
            const statementId = output?.statementId ?? (yield* createStatementId(id));
            // Observe the deterministic Sid before mutating. An existing Sid is
            // a true create/update collision and must be replaced; a
            // ResourceConflictException from an absent Sid is instead Lambda's
            // transient per-function policy mutation lock and is retried.
            if (yield* hasStatement(news.functionName, statementId)) {
                yield* removePermission({
                    FunctionName: news.functionName,
                    StatementId: statementId,
                }).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            }
            yield* addPermission({
                FunctionName: news.functionName,
                StatementId: statementId,
                Action: news.action,
                Principal: news.principal,
                SourceArn: news.sourceArn,
                SourceAccount: news.sourceAccount,
                EventSourceToken: news.eventSourceToken,
                FunctionUrlAuthType: news.functionUrlAuthType,
                InvokedViaFunctionUrl: news.invokedViaFunctionUrl,
                PrincipalOrgID: news.principalOrgID,
            });
            yield* session.note(`Permission ${statementId} on ${news.functionName}`);
            return {
                statementId,
                functionName: news.functionName,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* removePermission({
                FunctionName: output.functionName,
                StatementId: output.statementId,
            }).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Permission.js.map