import * as sd from "@distilled.cloud/aws/servicediscovery";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { toWireSeconds } from "../../Util/Duration.js";
import { awaitOperation, deregisterAllInstances, fetchObservedTags, retryWhileResourceInUse, syncTags, } from "./internal.js";
/**
 * An AWS Cloud Map service — a named entry in a namespace that instances
 * register against. For DNS namespaces, Cloud Map creates the configured DNS
 * records per registered instance; every service is also queryable via the
 * `DiscoverInstances` API. This is what ECS `serviceRegistries[].registryArn`
 * consumes.
 * ### Creating Services
 * **Example:** DNS Service with A Records
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const namespace = yield* AWS.CloudMap.PrivateDnsNamespace("AppNamespace", {
 *   name: "internal.example.com",
 *   vpc: vpc.vpcId,
 * });
 *
 * const service = yield* AWS.CloudMap.Service("Backend", {
 *   namespaceId: namespace.namespaceId,
 *   dnsRecords: [{ type: "A", ttl: "10 seconds" }],
 *   routingPolicy: "MULTIVALUE",
 * });
 * ```
 *
 * **Example:** API-only Service in an HTTP Namespace
 * ```typescript
 * const namespace = yield* AWS.CloudMap.HttpNamespace("AppNamespace");
 * const service = yield* AWS.CloudMap.Service("Backend", {
 *   namespaceId: namespace.namespaceId,
 * });
 * ```
 *
 * **Example:** Service with Custom Health Checks
 * ```typescript
 * const service = yield* AWS.CloudMap.Service("Backend", {
 *   namespaceId: namespace.namespaceId,
 *   dnsRecords: [{ type: "SRV", ttl: "10 seconds" }],
 *   healthCheckCustomConfig: {},
 * });
 * ```
 *
 * **Example:** Service with Custom Attributes
 * ```typescript
 * const service = yield* AWS.CloudMap.Service("Backend", {
 *   namespaceId: namespace.namespaceId,
 *   attributes: { tier: "backend", version: "2" },
 * });
 * ```
 *
 * ### Discovering Instances
 * **Example:** Discover Healthy Instances from a Lambda
 * ```typescript
 * // init
 * const discover = yield* AWS.CloudMap.DiscoverInstances(service);
 *
 * // runtime
 * const { Instances } = yield* discover({ HealthStatus: "HEALTHY" });
 * ```
 *
 * @resource
 */
export const Service = Resource("AWS.CloudMap.Service");
export const ServiceProvider = () => Provider.effect(Service, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        // 63 = the Route 53 per-label limit; the service name becomes the
        // DNS label `{name}.{namespace}` for DNS namespaces
        return (props.name ??
            (yield* createPhysicalName({ id, maxLength: 63, lowercase: true })));
    });
    /** Observe by cached id, falling back to name lookup in the namespace. */
    const observeService = Effect.fn(function* (namespaceId, name, serviceId) {
        if (serviceId !== undefined) {
            const byId = yield* sd.getService({ Id: serviceId }).pipe(Effect.map((r) => r.Service), Effect.catchTag("ServiceNotFound", () => Effect.succeed(undefined)));
            if (byId !== undefined) {
                return byId;
            }
        }
        const summary = yield* sd.listServices
            .pages({
            Filters: [
                { Name: "NAMESPACE_ID", Values: [namespaceId], Condition: "EQ" },
            ],
        })
            .pipe(Stream.map((page) => page.Services ?? []), Stream.flattenIterable, Stream.filter((s) => s.Name === name), Stream.runHead, Effect.map(Option.getOrUndefined));
        if (summary?.Id === undefined) {
            return undefined;
        }
        return yield* sd.getService({ Id: summary.Id }).pipe(Effect.map((r) => r.Service), Effect.catchTag("ServiceNotFound", () => Effect.succeed(undefined)));
    });
    const resolveNamespaceName = Effect.fn(function* (namespaceId) {
        const namespace = yield* sd.getNamespace({ Id: namespaceId });
        return namespace.Namespace?.Name ?? "";
    });
    const toDesiredDnsConfig = (props) => props.dnsRecords !== undefined
        ? {
            DnsRecords: props.dnsRecords.map((record) => ({
                Type: record.type,
                TTL: toWireSeconds(record.ttl),
            })),
            RoutingPolicy: props.routingPolicy,
        }
        : undefined;
    const toDesiredHealthCheckConfig = (props) => props.healthCheckConfig !== undefined
        ? {
            Type: props.healthCheckConfig.type,
            ResourcePath: props.healthCheckConfig.resourcePath,
            FailureThreshold: props.healthCheckConfig.failureThreshold,
        }
        : undefined;
    const recordKey = (records) => records
        .map((r) => `${r.Type}:${r.TTL}`)
        .sort()
        .join(",");
    const recordTypeKey = (records) => (records ?? [])
        .map((r) => r.type)
        .sort()
        .join(",");
    return Service.Provider.of({
        stables: [
            "serviceId",
            "serviceArn",
            "serviceName",
            "namespaceId",
            "namespaceName",
        ],
        list: () => Effect.gen(function* () {
            const pages = yield* sd.listServices
                .pages({})
                .pipe(Stream.runCollect);
            const summaries = Array.from(pages).flatMap((page) => page.Services ?? []);
            const items = yield* Effect.forEach(summaries, (summary) => Effect.gen(function* () {
                if (summary.Id === undefined)
                    return undefined;
                const service = yield* sd.getService({ Id: summary.Id }).pipe(Effect.map((r) => r.Service), Effect.catchTag("ServiceNotFound", () => Effect.succeed(undefined)));
                if (service?.Id === undefined ||
                    service.Arn === undefined ||
                    service.Name === undefined ||
                    service.NamespaceId === undefined) {
                    return undefined;
                }
                const namespaceName = yield* resolveNamespaceName(service.NamespaceId).pipe(Effect.catchTag("NamespaceNotFound", () => Effect.succeed("")));
                return {
                    serviceId: service.Id,
                    serviceArn: service.Arn,
                    serviceName: service.Name,
                    namespaceId: service.NamespaceId,
                    namespaceName,
                };
            }), { concurrency: 10 });
            return items.filter((item) => item !== undefined);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const namespaceId = output?.namespaceId ?? olds?.namespaceId;
            if (namespaceId === undefined)
                return undefined;
            const name = output?.serviceName ?? (yield* createName(id, olds ?? {}));
            const service = yield* observeService(namespaceId, name, output?.serviceId);
            if (service?.Id === undefined ||
                service.Arn === undefined ||
                service.NamespaceId === undefined) {
                return undefined;
            }
            const namespaceName = yield* resolveNamespaceName(service.NamespaceId).pipe(Effect.catchTag("NamespaceNotFound", () => Effect.succeed("")));
            const attrs = {
                serviceId: service.Id,
                serviceArn: service.Arn,
                serviceName: service.Name ?? name,
                namespaceId: service.NamespaceId,
                namespaceName,
            };
            const tags = yield* fetchObservedTags(attrs.serviceArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName) {
                return { action: "replace" };
            }
            if (olds.namespaceId !== news.namespaceId) {
                return { action: "replace" };
            }
            if (olds.routingPolicy !== news.routingPolicy) {
                return { action: "replace" };
            }
            if (recordTypeKey(olds.dnsRecords) !== recordTypeKey(news.dnsRecords)) {
                return { action: "replace" };
            }
            // healthCheckCustomConfig cannot be added, changed, or removed
            if ((olds.healthCheckCustomConfig === undefined) !==
                (news.healthCheckCustomConfig === undefined)) {
                return { action: "replace" };
            }
            if (olds.type !== news.type) {
                return { action: "replace" };
            }
            // description / record TTLs / healthCheckConfig / tags → update
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.serviceName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE — cloud state is authoritative
            let service = yield* observeService(news.namespaceId, name, output?.serviceId);
            // 2. ENSURE — createService is synchronous
            if (service === undefined) {
                service = yield* sd
                    .createService({
                    Name: name,
                    NamespaceId: news.namespaceId,
                    Description: news.description,
                    DnsConfig: toDesiredDnsConfig(news),
                    HealthCheckConfig: toDesiredHealthCheckConfig(news),
                    HealthCheckCustomConfig: news.healthCheckCustomConfig
                        ? {
                            FailureThreshold: news.healthCheckCustomConfig.failureThreshold,
                        }
                        : undefined,
                    Type: news.type,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                })
                    .pipe(Effect.map((r) => r.Service), 
                // a concurrent reconciler created it — observe instead
                Effect.catchTag("ServiceAlreadyExists", (e) => e.ServiceId !== undefined
                    ? sd
                        .getService({ Id: e.ServiceId })
                        .pipe(Effect.map((r) => r.Service))
                    : observeService(news.namespaceId, name, undefined)));
            }
            if (service?.Id === undefined || service.Arn === undefined) {
                return yield* Effect.fail(new sd.ServiceNotFound({
                    message: `service ${name} not visible after create`,
                }));
            }
            // 3. SYNC — description / DNS record TTLs / health check config.
            // UpdateService deletes DnsRecords/HealthCheckConfig omitted from
            // the change, so we always send the FULL desired configuration and
            // only skip the call when observed already matches desired.
            const desiredDns = toDesiredDnsConfig(news);
            const desiredHealth = toDesiredHealthCheckConfig(news);
            const observedRecords = service.DnsConfig?.DnsRecords ?? [];
            const desiredRecords = desiredDns?.DnsRecords ?? [];
            const dnsDelta = recordKey([...observedRecords]) !== recordKey(desiredRecords);
            const descriptionDelta = (news.description ?? undefined) !==
                (service.Description ?? undefined);
            const observedHealth = service.HealthCheckConfig;
            const healthDelta = (desiredHealth === undefined) !== (observedHealth === undefined) ||
                (desiredHealth !== undefined &&
                    (desiredHealth.Type !== observedHealth?.Type ||
                        (desiredHealth.ResourcePath ?? undefined) !==
                            (observedHealth?.ResourcePath ?? undefined) ||
                        (desiredHealth.FailureThreshold ?? undefined) !==
                            (observedHealth?.FailureThreshold ?? undefined)));
            if (dnsDelta || descriptionDelta || healthDelta) {
                const update = yield* sd.updateService({
                    Id: service.Id,
                    Service: {
                        Description: news.description,
                        DnsConfig: desiredDns !== undefined
                            ? { DnsRecords: desiredDns.DnsRecords }
                            : undefined,
                        HealthCheckConfig: desiredHealth,
                    },
                });
                if (update.OperationId !== undefined) {
                    yield* awaitOperation(update.OperationId);
                }
            }
            // 3b. SYNC SERVICE ATTRIBUTES — diff OBSERVED custom attributes
            // against the desired map; upsert changed keys, delete undeclared
            const observedAttributes = yield* sd.getServiceAttributes({ ServiceId: service.Id }).pipe(Effect.map((r) => r.ServiceAttributes?.Attributes ?? {}), Effect.catchTag("ServiceNotFound", () => Effect.succeed({})));
            const desiredAttributes = news.attributes ?? {};
            const attributeUpserts = Object.entries(desiredAttributes).filter(([key, value]) => observedAttributes[key] !== value);
            const attributeRemovals = Object.keys(observedAttributes).filter((key) => !(key in desiredAttributes));
            if (attributeUpserts.length > 0) {
                yield* sd.updateServiceAttributes({
                    ServiceId: service.Id,
                    Attributes: Object.fromEntries(attributeUpserts),
                });
            }
            if (attributeRemovals.length > 0) {
                yield* sd.deleteServiceAttributes({
                    ServiceId: service.Id,
                    Attributes: attributeRemovals,
                });
            }
            // 3c. SYNC TAGS — diff against OBSERVED cloud tags
            const observedTags = yield* fetchObservedTags(service.Arn);
            yield* syncTags(service.Arn, observedTags, desiredTags);
            const namespaceId = service.NamespaceId ?? news.namespaceId;
            const namespaceName = yield* resolveNamespaceName(namespaceId);
            yield* session.note(service.Id);
            return {
                serviceId: service.Id,
                serviceArn: service.Arn,
                serviceName: service.Name ?? name,
                namespaceId,
                namespaceName,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // OBSERVE — instances registered at runtime (RegisterInstance
            // binding) block DeleteService; deregister any that remain and
            // await the async operations before deleting.
            yield* deregisterAllInstances(output.serviceId).pipe(Effect.catchTag("ServiceNotFound", () => Effect.void));
            // deregistrations still propagating surface as ResourceInUse —
            // retry through the visibility window (bounded)
            yield* retryWhileResourceInUse(sd.deleteService({ Id: output.serviceId })).pipe(Effect.catchTag("ServiceNotFound", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Service.js.map