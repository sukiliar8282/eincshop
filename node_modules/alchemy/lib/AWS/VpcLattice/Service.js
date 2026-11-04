import * as vpclattice from "@distilled.cloud/aws/vpc-lattice";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, tagRecord, } from "../../Tags.js";
import { toWireSeconds } from "../../Util/Duration.js";
import { retryOnConflict, waitUntilAbsent, waitUntilStable, } from "./internal.js";
/**
 * An Amazon VPC Lattice service — an independently deployable unit of software
 * (running on Lambda, ECS, EC2, or elsewhere) that is made discoverable through
 * a service network. Cheap control-plane resource.
 *
 * ### Creating Services
 * **Example:** Basic Service
 * ```typescript
 * const service = yield* Service("PaymentsService", {});
 * ```
 *
 * **Example:** Service with Custom Domain
 * ```typescript
 * const service = yield* Service("PaymentsService", {
 *   customDomainName: "payments.internal.example.com",
 *   certificateArn: cert.certificateArn,
 *   authType: "AWS_IAM",
 *   idleTimeout: "60 seconds",
 * });
 * ```
 *
 * @resource
 */
export const Service = Resource("AWS.VpcLattice.Service");
export const ServiceProvider = () => Provider.effect(Service, Effect.gen(function* () {
    const toName = (id, props = {}) => props.name
        ? Effect.succeed(props.name)
        : createPhysicalName({ id, maxLength: 40, lowercase: true });
    // getService only accepts an id or ARN — never a name.
    const observe = (serviceIdentifier) => vpclattice
        .getService({ serviceIdentifier })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const findByName = (name) => vpclattice.listServices.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
        .flatMap((page) => page.items ?? [])
        .find((s) => s.name === name)), Effect.flatMap((summary) => summary?.id ? observe(summary.id) : Effect.succeed(undefined)));
    const syncTags = Effect.fn(function* (arn, desiredTags) {
        const listed = yield* vpclattice.listTagsForResource({
            resourceArn: arn,
        });
        const { removed, upsert } = diffTags(tagRecord(listed.tags), desiredTags);
        if (upsert.length > 0) {
            yield* vpclattice.tagResource({
                resourceArn: arn,
                tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
            });
        }
        if (removed.length > 0) {
            yield* vpclattice.untagResource({
                resourceArn: arn,
                tagKeys: removed,
            });
        }
    });
    return {
        stables: ["serviceId", "serviceArn", "name"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
            // Custom domain name is fixed at creation time.
            if ((olds?.customDomainName ?? undefined) !== news.customDomainName) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const service = output?.serviceId
                ? yield* observe(output.serviceId)
                : yield* findByName(yield* toName(id, olds ?? {}));
            if (!service?.arn || !service.id)
                return undefined;
            const listed = yield* vpclattice.listTagsForResource({
                resourceArn: service.arn,
            });
            const attrs = {
                serviceId: service.id,
                serviceArn: service.arn,
                name: service.name,
                status: service.status ?? "UNKNOWN",
                dnsName: service.dnsEntry?.domainName,
                authType: service.authType ?? "NONE",
                tags: tagRecord(listed.tags),
            };
            return (yield* hasAlchemyTags(id, listed.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = yield* toName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const desiredAuthType = news.authType ?? "NONE";
            const desiredIdleTimeoutSeconds = toWireSeconds(news.idleTimeout);
            const existing = output?.serviceId
                ? yield* observe(output.serviceId)
                : yield* findByName(name);
            let serviceId;
            let serviceArn;
            if (!existing?.arn || !existing.id) {
                const created = yield* vpclattice
                    .createService({
                    name,
                    authType: desiredAuthType,
                    customDomainName: news.customDomainName,
                    certificateArn: news.certificateArn,
                    idleTimeoutSeconds: desiredIdleTimeoutSeconds,
                })
                    .pipe(Effect.catchTag("ConflictException", () => findByName(name)));
                if (!created?.arn || !created.id) {
                    return yield* Effect.fail(new Error(`Failed to create service ${name}`));
                }
                serviceId = created.id;
                serviceArn = created.arn;
            }
            else {
                serviceId = existing.id;
                serviceArn = existing.arn;
            }
            // VPC Lattice services reject updates/tags while CREATE_IN_PROGRESS;
            // wait for a stable status before syncing mutable settings.
            const stable = yield* waitUntilStable(observe(serviceId));
            const needsUpdate = (stable?.authType ?? "NONE") !== desiredAuthType ||
                stable?.certificateArn !== news.certificateArn ||
                stable?.idleTimeoutSeconds !== desiredIdleTimeoutSeconds;
            if (needsUpdate) {
                yield* vpclattice.updateService({
                    serviceIdentifier: serviceId,
                    authType: desiredAuthType,
                    certificateArn: news.certificateArn,
                    idleTimeoutSeconds: desiredIdleTimeoutSeconds,
                });
            }
            yield* syncTags(serviceArn, desiredTags);
            const final = yield* observe(serviceId);
            yield* session.note(serviceArn);
            return {
                serviceId,
                serviceArn,
                name,
                status: final?.status ?? stable?.status ?? "ACTIVE",
                dnsName: final?.dnsEntry?.domainName ?? stable?.dnsEntry?.domainName,
                authType: desiredAuthType,
                tags: desiredTags,
            };
        }),
        list: () => Effect.gen(function* () {
            const summaries = yield* vpclattice.listServices.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.items ?? [])));
            return yield* Effect.forEach(summaries.filter((s) => s.id != null && s.arn != null), (summary) => Effect.gen(function* () {
                const service = yield* observe(summary.id);
                const listed = yield* vpclattice.listTagsForResource({
                    resourceArn: summary.arn,
                });
                return {
                    serviceId: summary.id,
                    serviceArn: summary.arn,
                    name: summary.name,
                    status: summary.status ?? "UNKNOWN",
                    dnsName: summary.dnsEntry?.domainName,
                    authType: service?.authType ?? "NONE",
                    tags: tagRecord(listed.tags),
                };
            }), { concurrency: 10 });
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryOnConflict(vpclattice.deleteService({ serviceIdentifier: output.serviceId })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            yield* waitUntilAbsent(observe(output.serviceId));
        }),
    };
}));
//# sourceMappingURL=Service.js.map