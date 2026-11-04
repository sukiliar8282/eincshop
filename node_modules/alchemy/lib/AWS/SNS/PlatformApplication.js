import * as sns from "@distilled.cloud/aws/sns";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * An Amazon SNS platform application for mobile push notifications (FCM,
 * APNS, ADM, Baidu).
 *
 * A platform application holds the push service credentials; device tokens
 * are registered against it at runtime with the
 * `CreatePlatformEndpoint` binding, and messages are delivered with
 * `PublishToEndpoint`. SNS validates the credential when the application is
 * created, so a real push-service credential is required.
 * ### Creating Platform Applications
 * **Example:** FCM (GCM) Application
 * ```typescript
 * import * as SNS from "alchemy/AWS/SNS";
 * import * as Redacted from "effect/Redacted";
 *
 * const app = yield* SNS.PlatformApplication("PushApp", {
 *   platform: "GCM",
 *   platformCredential: Redacted.make(process.env.FCM_API_KEY!),
 * });
 * ```
 *
 * **Example:** APNS Application
 * ```typescript
 * const app = yield* SNS.PlatformApplication("IosPushApp", {
 *   platform: "APNS",
 *   platformCredential: Redacted.make(apnsPrivateKey),
 *   platformPrincipal: Redacted.make(apnsCertificate),
 * });
 * ```
 *
 * ### Runtime Endpoints
 * **Example:** Register a Device Token at Runtime
 * ```typescript
 * // init
 * const createEndpoint = yield* SNS.CreatePlatformEndpoint(app);
 * const publishToEndpoint = yield* SNS.PublishToEndpoint(app);
 *
 * // runtime
 * const endpoint = yield* createEndpoint({ Token: deviceToken });
 * yield* publishToEndpoint({
 *   TargetArn: endpoint.EndpointArn!,
 *   Message: "hello",
 * });
 * ```
 *
 * @resource
 */
export const PlatformApplication = Resource("AWS.SNS.PlatformApplication");
export const PlatformApplicationProvider = () => Provider.succeed(PlatformApplication, {
    list: Effect.fn(function* () {
        const applications = yield* sns.listPlatformApplications.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.PlatformApplications ?? [])));
        return applications.flatMap((application) => {
            const arn = application.PlatformApplicationArn;
            if (!arn)
                return [];
            return [toApplicationAttributes(arn, application.Attributes)];
        });
    }),
    read: Effect.fn(function* ({ id, olds, output }) {
        const arn = output?.platformApplicationArn ??
            (yield* toApplicationArn(id, olds ?? { platform: "" }));
        return yield* readApplication(arn);
    }),
    stables: ["platformApplicationArn", "name", "platform"],
    diff: Effect.fn(function* ({ id, news, olds }) {
        if (!isResolved(news))
            return undefined;
        if (news.platform !== olds.platform) {
            return { action: "replace" };
        }
        const oldName = yield* toApplicationName(id, olds);
        const newName = yield* toApplicationName(id, news);
        if (oldName !== newName) {
            return { action: "replace" };
        }
    }),
    reconcile: Effect.fn(function* ({ id, news, olds, output, session }) {
        const name = yield* toApplicationName(id, news);
        const arn = output?.platformApplicationArn ?? (yield* toApplicationArn(id, news));
        // Observe — the credential attributes are write-only, so observation
        // covers existence plus the non-sensitive mutable attributes.
        const observed = yield* sns
            .getPlatformApplicationAttributes({ PlatformApplicationArn: arn })
            .pipe(Effect.map((response) => toAttributeMap(response.Attributes)), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
        const credentialAttributes = {
            PlatformCredential: Redacted.value(news.platformCredential),
            ...(news.platformPrincipal
                ? { PlatformPrincipal: Redacted.value(news.platformPrincipal) }
                : undefined),
        };
        const desiredAttributes = toAttributeMap(news.attributes);
        // Ensure — create carries the full attribute set (credentials +
        // mutable attributes) in one call.
        if (observed === undefined) {
            const created = yield* sns.createPlatformApplication({
                Name: name,
                Platform: news.platform,
                Attributes: { ...desiredAttributes, ...credentialAttributes },
            });
            const platformApplicationArn = created.PlatformApplicationArn ?? arn;
            yield* session.note(platformApplicationArn);
            const state = yield* readApplication(platformApplicationArn);
            return (state ??
                toApplicationAttributes(platformApplicationArn, desiredAttributes));
        }
        // Sync — mutable non-secret attributes diff observed vs desired;
        // removed previously-managed keys reset to "". Credentials cannot be
        // observed, so they are pushed on adoption (`olds` absent) or when the
        // configured value changes (`olds` is only a hint to skip a no-op).
        const updates = {};
        for (const [key, value] of Object.entries(desiredAttributes)) {
            if (observed[key] !== value) {
                updates[key] = value;
            }
        }
        for (const key of Object.keys(toAttributeMap(olds?.attributes))) {
            if (!(key in desiredAttributes)) {
                updates[key] = "";
            }
        }
        const credentialChanged = olds === undefined ||
            Redacted.value(olds.platformCredential) !==
                Redacted.value(news.platformCredential) ||
            (olds.platformPrincipal === undefined) !==
                (news.platformPrincipal === undefined) ||
            (olds.platformPrincipal !== undefined &&
                news.platformPrincipal !== undefined &&
                Redacted.value(olds.platformPrincipal) !==
                    Redacted.value(news.platformPrincipal));
        if (credentialChanged) {
            Object.assign(updates, credentialAttributes);
        }
        if (Object.keys(updates).length > 0) {
            yield* sns.setPlatformApplicationAttributes({
                PlatformApplicationArn: arn,
                Attributes: updates,
            });
        }
        yield* session.note(arn);
        const state = yield* readApplication(arn);
        return state ?? toApplicationAttributes(arn, desiredAttributes);
    }),
    delete: Effect.fn(function* ({ output }) {
        // `DeletePlatformApplication` is idempotent — deleting a non-existent
        // application succeeds — so only genuine failures propagate.
        yield* sns.deletePlatformApplication({
            PlatformApplicationArn: output.platformApplicationArn,
        });
    }),
});
const toApplicationName = Effect.fn(function* (id, props) {
    if (props.name) {
        return props.name;
    }
    return yield* createPhysicalName({ id, maxLength: 256 });
});
const toApplicationArn = Effect.fn(function* (id, props) {
    const name = yield* toApplicationName(id, props);
    const { accountId, region } = yield* AWSEnvironment.current;
    return `arn:aws:sns:${region}:${accountId}:app/${props.platform}/${name}`;
});
const toAttributeMap = (attributes) => Object.fromEntries(Object.entries(attributes ?? {}).filter((entry) => typeof entry[1] === "string"));
const toApplicationAttributes = (arn, attributes) => {
    const observed = toAttributeMap(attributes);
    // arn:aws:sns:{region}:{account}:app/{Platform}/{Name}
    const [, platform = "", name = ""] = arn.split(":").at(-1)?.split("/") ?? [];
    return {
        platformApplicationArn: arn,
        name,
        platform,
        enabled: observed.Enabled !== "false",
        attributes: observed,
    };
};
const readApplication = Effect.fn(function* (arn) {
    const observed = yield* sns
        .getPlatformApplicationAttributes({ PlatformApplicationArn: arn })
        .pipe(Effect.map((response) => toAttributeMap(response.Attributes)), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    if (observed === undefined) {
        return undefined;
    }
    return toApplicationAttributes(arn, observed);
});
//# sourceMappingURL=PlatformApplication.js.map