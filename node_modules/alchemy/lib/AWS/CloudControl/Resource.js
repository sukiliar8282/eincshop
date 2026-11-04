import * as cloudcontrol from "@distilled.cloud/aws/cloudcontrol";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource as makeResource } from "../../Resource.js";
/**
 * A generic AWS resource managed through the Cloud Control API — the escape
 * hatch that covers hundreds of CloudFormation resource types with a single
 * Alchemy resource.
 *
 * Provide a CloudFormation `typeName` and a `desiredState` object; the provider
 * drives Cloud Control's asynchronous create/update/delete and polls the
 * request token (bounded) until it reaches `SUCCESS`, surfacing a `FAILED`
 * operation as a typed error rather than hanging. Updates are expressed as an
 * RFC 6902 JSON Patch computed over the keys you specify.
 * ### Managing a Resource
 * **Example:** SSM Parameter
 * ```typescript
 * const param = yield* CloudControl.Resource("Greeting", {
 *   typeName: "AWS::SSM::Parameter",
 *   desiredState: {
 *     Name: "/app/greeting",
 *     Type: "String",
 *     Value: "hello",
 *   },
 * });
 * // param.identifier -> "/app/greeting"
 * // param.properties.Value -> "hello"
 * ```
 *
 * **Example:** SNS Topic
 * ```typescript
 * const topic = yield* CloudControl.Resource("Alerts", {
 *   typeName: "AWS::SNS::Topic",
 *   desiredState: { TopicName: "alerts", DisplayName: "Alerts" },
 * });
 * // topic.identifier -> "arn:aws:sns:us-west-2:...:alerts"
 * ```
 *
 * @resource
 */
export const Resource = makeResource("AWS.CloudControl.Resource");
class ResourceRequestNotSettled extends Data.TaggedError("ResourceRequestNotSettled") {
}
class ResourceRequestFailed extends Data.TaggedError("ResourceRequestFailed") {
}
/** Unwrap distilled's sensitive-string decoding to a plain string. */
const plain = (value) => value === undefined || typeof value === "string"
    ? value
    : Redacted.value(value);
const parseProperties = (properties) => {
    const raw = plain(properties);
    if (raw === undefined)
        return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed !== null && typeof parsed === "object" ? parsed : {};
    }
    catch {
        return {};
    }
};
/** RFC 6901 escape for a JSON Pointer path segment. */
const escapePointer = (key) => key.replace(/~/g, "~0").replace(/\//g, "~1");
/**
 * Build an RFC 6902 JSON Patch that converges the observed properties to the
 * user-specified desired state. Only keys present in `desired` are touched —
 * create-only properties the user never changes are left alone (patching them
 * would trigger `NotUpdatableException`).
 */
const buildPatch = (observed, desired) => Object.entries(desired).flatMap(([key, value]) => {
    const hasKey = Object.prototype.hasOwnProperty.call(observed, key);
    if (hasKey && JSON.stringify(observed[key]) === JSON.stringify(value)) {
        return [];
    }
    return [
        {
            op: hasKey ? "replace" : "add",
            path: `/${escapePointer(key)}`,
            value,
        },
    ];
});
export const CloudControlResourceProvider = () => Provider.effect(Resource, Effect.gen(function* () {
    /**
     * Poll a Cloud Control request token until the operation settles.
     * Operations are typically fast (seconds); budget ~5 min (60 * 5s).
     * Returns the terminal ProgressEvent, failing on FAILED.
     */
    const waitForRequest = Effect.fn(function* (requestToken, typeName) {
        const event = yield* cloudcontrol
            .getResourceRequestStatus({ RequestToken: requestToken })
            .pipe(Effect.map((r) => r.ProgressEvent), Effect.flatMap((e) => {
            const status = e?.OperationStatus;
            if (status === "PENDING" ||
                status === "IN_PROGRESS" ||
                status === "CANCEL_IN_PROGRESS") {
                return Effect.fail(new ResourceRequestNotSettled({
                    requestToken,
                    status: status ?? "UNKNOWN",
                }));
            }
            return Effect.succeed(e);
        }), Effect.retry({
            while: (e) => e._tag === "ResourceRequestNotSettled",
            schedule: Schedule.max([
                Schedule.fixed("5 seconds"),
                Schedule.recurs(60),
            ]),
        }));
        if (event?.OperationStatus !== "SUCCESS") {
            return yield* Effect.fail(new ResourceRequestFailed({
                typeName,
                operation: event?.Operation ?? "UNKNOWN",
                errorCode: event?.ErrorCode,
                statusMessage: event?.StatusMessage,
            }));
        }
        return event;
    });
    /** Read live resource properties; a missing resource reads as absent. */
    const getResource = Effect.fn(function* (typeName, identifier) {
        return yield* cloudcontrol
            .getResource({ TypeName: typeName, Identifier: identifier })
            .pipe(Effect.map((r) => r.ResourceDescription), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return {
        stables: ["typeName", "identifier"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((olds?.typeName ?? undefined) !== (news?.typeName ?? undefined)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ output }) {
            if (output?.identifier === undefined)
                return undefined;
            const description = yield* getResource(output.typeName, output.identifier);
            if (description?.Identifier === undefined)
                return undefined;
            return {
                typeName: output.typeName,
                identifier: description.Identifier,
                properties: parseProperties(description.Properties),
            };
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            const typeName = news.typeName;
            // 1. Observe — cloud state is authoritative; output is only an id
            // cache.
            let identifier = output?.identifier;
            let description = identifier !== undefined
                ? yield* getResource(typeName, identifier)
                : undefined;
            // 2. Ensure — create if missing, then poll to SUCCESS.
            if (description === undefined) {
                const created = yield* cloudcontrol.createResource({
                    TypeName: typeName,
                    TypeVersionId: news.typeVersionId,
                    RoleArn: news.roleArn,
                    DesiredState: JSON.stringify(news.desiredState),
                });
                const settled = yield* waitForRequest(created.ProgressEvent.RequestToken, typeName);
                identifier = settled.Identifier;
                description = yield* getResource(typeName, identifier);
            }
            else {
                // 3. Sync — patch only the drifted user-specified keys.
                identifier = description.Identifier;
                const patch = buildPatch(parseProperties(description.Properties), news.desiredState);
                if (patch.length > 0) {
                    const updated = yield* cloudcontrol.updateResource({
                        TypeName: typeName,
                        TypeVersionId: news.typeVersionId,
                        RoleArn: news.roleArn,
                        Identifier: identifier,
                        PatchDocument: JSON.stringify(patch),
                    });
                    yield* waitForRequest(updated.ProgressEvent.RequestToken, typeName);
                    description = yield* getResource(typeName, identifier);
                }
            }
            // 4. Return fresh attributes.
            yield* session.note(identifier);
            return {
                typeName,
                identifier,
                properties: parseProperties(description?.Properties),
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            const deleted = yield* cloudcontrol
                .deleteResource({
                TypeName: output.typeName,
                Identifier: output.identifier,
            })
                .pipe(Effect.map((r) => r.ProgressEvent), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (deleted?.RequestToken !== undefined) {
                yield* waitForRequest(deleted.RequestToken, output.typeName).pipe(
                // A resource already gone by the time deletion settles is not an
                // error.
                Effect.catchTag("ResourceRequestFailed", (e) => e.errorCode === "NotFound" ? Effect.void : Effect.fail(e)));
            }
        }),
        // Cloud Control's ListResources requires a TypeName; there is no
        // global enumeration across every managed type, so the generic
        // escape-hatch resource is not listable.
        list: () => Effect.succeed([]),
    };
}));
//# sourceMappingURL=Resource.js.map