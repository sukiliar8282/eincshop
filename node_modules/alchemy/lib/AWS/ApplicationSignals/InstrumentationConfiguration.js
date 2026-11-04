import * as appsignals from "@distilled.cloud/aws/application-signals";
import * as Effect from "effect/Effect";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags, hasAlchemyTags, } from "../../Tags.js";
/**
 * A CloudWatch Application Signals dynamic instrumentation configuration —
 * instructs instrumented SDK agents to capture a snapshot (arguments,
 * locals, return value, stack trace) at a specific code location of a
 * discovered service, without redeploying the application.
 *
 * Configurations are immutable after creation: every change except tags
 * replaces the configuration. Tags remain mutable through the standard
 * tagging APIs.
 *
 * ### Creating an Instrumentation Configuration
 * **Example:** Snapshot Probe on a Python Method
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const probe = yield* AWS.ApplicationSignals.InstrumentationConfiguration(
 *   "CheckoutProbe",
 *   {
 *     instrumentationType: "PROBE",
 *     service: "checkout-service",
 *     environment: "eks:prod",
 *     signalType: "SNAPSHOT",
 *     location: {
 *       Language: "Python",
 *       CodeUnit: "app.checkout",
 *       MethodName: "process_order",
 *       FilePath: "app/checkout.py",
 *       LineNumber: 42,
 *     },
 *     captureConfiguration: {
 *       CaptureLocals: ["order_id", "total"],
 *       CaptureLimits: { MaxHits: 100 },
 *     },
 *   },
 * );
 * ```
 *
 * **Example:** Expiring Probe with Attribute Filters
 * ```typescript
 * const probe = yield* AWS.ApplicationSignals.InstrumentationConfiguration(
 *   "DebugProbe",
 *   {
 *     instrumentationType: "PROBE",
 *     service: "checkout-service",
 *     environment: "eks:prod",
 *     signalType: "SNAPSHOT",
 *     location: {
 *       Language: "Java",
 *       ClassName: "com.example.Checkout",
 *       MethodName: "processOrder",
 *       FilePath: "src/main/java/com/example/Checkout.java",
 *     },
 *     captureConfiguration: {
 *       CaptureArguments: ["order"],
 *       CaptureLimits: { MaxHits: 10 },
 *     },
 *     expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
 *     attributeFilters: [{ "aws.local.operation": "POST /checkout" }],
 *   },
 * );
 * ```
 *
 * @resource
 */
export const InstrumentationConfiguration = Resource("AWS.ApplicationSignals.InstrumentationConfiguration");
/**
 * Normalize `expiresAt` (which the engine's state serialization flattens to
 * an ISO string) back to a `Date` for the wire.
 */
const toExpiresAt = (value) => value === undefined ? undefined : new Date(value);
/**
 * The identity + payload of a configuration in a canonical, comparable
 * shape. Everything here is create-only: a change replaces the resource.
 */
const immutableFingerprint = (props) => JSON.stringify({
    instrumentationType: props.instrumentationType,
    service: props.service,
    environment: props.environment,
    signalType: props.signalType,
    location: props.location,
    captureConfiguration: props.captureConfiguration,
    description: props.description,
    expiresAt: toExpiresAt(props.expiresAt)?.getTime(),
    attributeFilters: props.attributeFilters,
});
export const InstrumentationConfigurationProvider = () => Provider.effect(InstrumentationConfiguration, Effect.gen(function* () {
    /** The identity quadruple shared by get/create/delete requests. */
    const identity = (props) => ({
        InstrumentationType: props.instrumentationType,
        Service: props.service,
        Environment: props.environment,
        SignalType: props.signalType,
    });
    /** Observe by location hash (preferred) or code location. */
    const observe = Effect.fn(function* (props, locationHash) {
        const response = yield* appsignals
            .getInstrumentationConfiguration({
            ...identity(props),
            LocationIdentifier: locationHash
                ? { LocationHash: locationHash }
                : { CodeLocation: props.location },
        })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.Configuration;
    });
    const observedTags = (arn) => appsignals.listTagsForResource({ ResourceArn: arn }).pipe(Effect.map((response) => Object.fromEntries((response.Tags ?? []).map((tag) => [tag.Key, tag.Value]))), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({})));
    const toAttrs = (configuration) => ({
        arn: configuration.ARN,
        locationHash: configuration.LocationHash,
        instrumentationType: configuration.InstrumentationType,
        service: configuration.Service,
        environment: configuration.Environment,
        signalType: configuration.SignalType,
        createdAt: configuration.CreatedAt.toISOString(),
    });
    return {
        stables: [
            "arn",
            "locationHash",
            "instrumentationType",
            "service",
            "environment",
            "signalType",
        ],
        read: Effect.fn(function* ({ id, olds, output }) {
            const props = olds;
            if (props === undefined)
                return undefined;
            const found = yield* observe(props, output?.locationHash);
            if (found === undefined)
                return undefined;
            const attrs = toAttrs(found);
            const tags = yield* observedTags(found.ARN);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            // Configurations are immutable after creation — any change other
            // than tags replaces. Tags fall through to the default update.
            if (olds !== undefined &&
                immutableFingerprint(news) !== immutableFingerprint(olds)) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. Observe — cloud state is authoritative; `output` only caches
            //    the location hash.
            let live = yield* observe(news, output?.locationHash);
            if (live === undefined) {
                // 2. Ensure — create when missing; a concurrent create of the
                //    same location surfaces as ConflictException, which is a
                //    race: re-observe and continue.
                live = yield* appsignals
                    .createInstrumentationConfiguration({
                    ...identity(news),
                    Location: { CodeLocation: news.location },
                    CaptureConfiguration: {
                        CodeCapture: news.captureConfiguration,
                    },
                    Description: news.description,
                    ExpiresAt: toExpiresAt(news.expiresAt),
                    AttributeFilters: news.attributeFilters,
                    Tags: createTagsList(desiredTags),
                })
                    .pipe(Effect.catchTag("ConflictException", () => observe(news, undefined).pipe(Effect.flatMap((observed) => observed === undefined
                    ? Effect.fail(new Error(`instrumentation configuration for '${news.service}' conflicted but was not observable`))
                    : Effect.succeed(observed)))));
            }
            // 3. There is no update API — the diff replaces on any change to
            //    the immutable payload, so an observed configuration is
            //    already converged apart from tags.
            // 3b. SYNC TAGS — diff against OBSERVED cloud tags so adoption
            //     converges (create-time Tags only apply on first create).
            const currentTags = yield* observedTags(live.ARN);
            const { upsert, removed } = diffTags(currentTags, desiredTags);
            if (upsert.length > 0) {
                yield* appsignals.tagResource({
                    ResourceArn: live.ARN,
                    Tags: upsert,
                });
            }
            if (removed.length > 0) {
                yield* appsignals.untagResource({
                    ResourceArn: live.ARN,
                    TagKeys: removed,
                });
            }
            yield* session.note(live.LocationHash);
            return toAttrs(live);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* appsignals
                .deleteInstrumentationConfiguration({
                InstrumentationType: output.instrumentationType,
                Service: output.service,
                Environment: output.environment,
                SignalType: output.signalType,
                LocationIdentifier: { LocationHash: output.locationHash },
            })
                .pipe(
            // Idempotent delete — already-gone is success.
            Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
        // No account-wide enumeration API (listing requires a service +
        // environment + type scope).
        list: () => Effect.succeed([]),
    };
}));
//# sourceMappingURL=InstrumentationConfiguration.js.map