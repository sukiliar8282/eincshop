import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Effect from "effect/Effect";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
import { normalizePolicyDocument, stringifyPolicyDocument, } from "../IAM/Policy.js";
import { isDomainActive, isDomainDeletable, readDomainTags, repeatUntilDomainState, subsetDiffers, } from "./internal.js";
/**
 * An Amazon OpenSearch Service domain — a managed OpenSearch/Elasticsearch
 * cluster with a search/HTTP endpoint.
 *
 * Domains take roughly 15-25 minutes to provision (and about as long for
 * blue/green configuration changes) and are billed per instance-hour while
 * they exist. Destroy domains you are not using.
 * ### Creating a Domain
 * **Example:** Minimal Domain
 * ```typescript
 * // A single t3.small.search node with 10 GiB of gp3 EBS storage.
 * const domain = yield* Domain("Search", {});
 * ```
 *
 * **Example:** Encrypted Domain with Access Policy
 * ```typescript
 * const domain = yield* Domain("Search", {
 *   engineVersion: "OpenSearch_2.19",
 *   clusterConfig: { instanceType: "t3.small.search", instanceCount: 1 },
 *   ebsOptions: { volumeType: "gp3", volumeSize: 10 },
 *   encryptionAtRest: { enabled: true },
 *   nodeToNodeEncryption: true,
 *   domainEndpointOptions: {
 *     enforceHTTPS: true,
 *     tlsSecurityPolicy: "Policy-Min-TLS-1-2-2019-07",
 *   },
 *   accessPolicies: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: `arn:aws:iam::${accountId}:root` },
 *         Action: ["es:*"],
 *         Resource: `arn:aws:es:${region}:${accountId}:domain/*`,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * ### Multi-AZ Cluster
 * **Example:** Zone-Aware Cluster
 * ```typescript
 * const domain = yield* Domain("Search", {
 *   clusterConfig: {
 *     instanceType: "r7g.large.search",
 *     instanceCount: 2,
 *     zoneAwarenessEnabled: true,
 *     availabilityZoneCount: 2,
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Domain = Resource("AWS.OpenSearch.Domain");
const DEFAULT_INSTANCE_TYPE = "t3.small.search";
const toClusterConfig = (config) => ({
    InstanceType: config?.instanceType ?? DEFAULT_INSTANCE_TYPE,
    InstanceCount: config?.instanceCount ?? 1,
    DedicatedMasterEnabled: config?.dedicatedMasterEnabled,
    DedicatedMasterType: config?.dedicatedMasterType,
    DedicatedMasterCount: config?.dedicatedMasterCount,
    ZoneAwarenessEnabled: config?.zoneAwarenessEnabled,
    ZoneAwarenessConfig: config?.availabilityZoneCount !== undefined
        ? { AvailabilityZoneCount: config.availabilityZoneCount }
        : undefined,
    WarmEnabled: config?.warmEnabled,
    WarmType: config?.warmType,
    WarmCount: config?.warmCount,
    MultiAZWithStandbyEnabled: config?.multiAZWithStandbyEnabled,
});
const toEbsOptions = (ebs) => ebs?.enabled === false
    ? { EBSEnabled: false }
    : {
        EBSEnabled: true,
        VolumeType: ebs?.volumeType ?? "gp3",
        VolumeSize: ebs?.volumeSize ?? 10,
        Iops: ebs?.iops,
        Throughput: ebs?.throughput,
    };
const toEndpointOptions = (options) => options === undefined
    ? undefined
    : {
        EnforceHTTPS: options.enforceHTTPS,
        TLSSecurityPolicy: options.tlsSecurityPolicy,
        CustomEndpointEnabled: options.customEndpointEnabled,
        CustomEndpoint: options.customEndpoint,
        CustomEndpointCertificateArn: options.customEndpointCertificateArn,
    };
const toAccessPolicies = (policy) => policy === undefined
    ? undefined
    : typeof policy === "string"
        ? policy
        : stringifyPolicyDocument(policy);
const toVpcOptions = (options) => options === undefined
    ? undefined
    : {
        SubnetIds: options.subnetIds,
        SecurityGroupIds: options.securityGroupIds,
    };
export const DomainProvider = () => Provider.effect(Domain, Effect.gen(function* () {
    const toName = (id, props) => props.domainName
        ? Effect.succeed(props.domainName)
        : createPhysicalName({ id, maxLength: 28, lowercase: true });
    const readDomain = Effect.fn(function* (name) {
        return yield* opensearch.describeDomain({ DomainName: name }).pipe(Effect.map((response) => response.DomainStatus), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const waitForActive = Effect.fn(function* (name) {
        const domain = yield* repeatUntilDomainState(readDomain(name), isDomainActive);
        if (domain === undefined) {
            return yield* Effect.fail(new Error(`OpenSearch domain '${name}' not found while waiting`));
        }
        return domain;
    });
    const toAttrs = Effect.fn(function* (domain) {
        return {
            domainName: domain.DomainName,
            domainArn: domain.ARN,
            domainId: domain.DomainId,
            engineVersion: domain.EngineVersion,
            endpoint: domain.Endpoint ?? domain.EndpointV2,
            created: domain.Created === true,
            processing: domain.Processing === true,
            tags: yield* readDomainTags(domain.ARN),
        };
    });
    return {
        stables: ["domainName", "domainArn", "domainId"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            const o = olds ?? {};
            const n = news ?? {};
            if ((yield* toName(id, o)) !== (yield* toName(id, n))) {
                return { action: "replace" };
            }
            // Encryption at rest and node-to-node encryption can be ENABLED
            // in place but never disabled — disabling replaces the domain.
            if (o.encryptionAtRest?.enabled !== false &&
                o.encryptionAtRest !== undefined &&
                n.encryptionAtRest?.enabled === false) {
                return { action: "replace" };
            }
            if (o.nodeToNodeEncryption === true &&
                n.nodeToNodeEncryption === false) {
                return { action: "replace" };
            }
            // Moving a domain between public and VPC endpoints replaces it.
            if ((o.vpcOptions === undefined) !== (n.vpcOptions === undefined)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.domainName ?? (yield* toName(id, olds ?? {}));
            const domain = yield* readDomain(name);
            if (domain === undefined)
                return undefined;
            const attrs = yield* toAttrs(domain);
            return (yield* hasAlchemyTags(id, attrs.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const props = news;
            const name = output?.domainName ?? (yield* toName(id, props));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...props.tags };
            // 1. Observe — cloud state is authoritative.
            let observed = yield* readDomain(name);
            // 2. Ensure — create if missing; tolerate AlreadyExists as a race.
            if (observed === undefined) {
                yield* opensearch
                    .createDomain({
                    DomainName: name,
                    EngineVersion: props.engineVersion,
                    ClusterConfig: toClusterConfig(props.clusterConfig),
                    EBSOptions: toEbsOptions(props.ebsOptions),
                    AccessPolicies: toAccessPolicies(props.accessPolicies),
                    IPAddressType: props.ipAddressType,
                    SnapshotOptions: props.snapshotOptions !== undefined
                        ? {
                            AutomatedSnapshotStartHour: props.snapshotOptions.automatedSnapshotStartHour,
                        }
                        : undefined,
                    VPCOptions: toVpcOptions(props.vpcOptions),
                    EncryptionAtRestOptions: props.encryptionAtRest !== undefined
                        ? {
                            Enabled: props.encryptionAtRest.enabled ?? true,
                            KmsKeyId: props.encryptionAtRest.kmsKeyId,
                        }
                        : undefined,
                    NodeToNodeEncryptionOptions: props.nodeToNodeEncryption !== undefined
                        ? { Enabled: props.nodeToNodeEncryption }
                        : undefined,
                    AdvancedOptions: props.advancedOptions,
                    DomainEndpointOptions: toEndpointOptions(props.domainEndpointOptions),
                    TagList: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                })
                    .pipe(Effect.catchTag("ResourceAlreadyExistsException", () => Effect.void));
            }
            // Provisioning and blue/green config changes both surface as
            // Processing=true; wait (bounded) so config updates do not fail.
            observed = yield* waitForActive(name);
            // 3. Sync — compute the update delta from OBSERVED state.
            const update = {
                DomainName: name,
            };
            let mutated = false;
            const desiredCluster = toClusterConfig(props.clusterConfig);
            if (subsetDiffers(desiredCluster, observed.ClusterConfig)) {
                update.ClusterConfig = desiredCluster;
                mutated = true;
            }
            const desiredEbs = toEbsOptions(props.ebsOptions);
            if (subsetDiffers(desiredEbs, observed.EBSOptions)) {
                update.EBSOptions = desiredEbs;
                mutated = true;
            }
            // Drift-compare canonicalized documents so key order / encoding
            // differences in what OpenSearch echoes back never cause a
            // spurious blue/green config change on re-deploy.
            if (props.accessPolicies !== undefined &&
                normalizePolicyDocument(props.accessPolicies) !==
                    normalizePolicyDocument(observed.AccessPolicies ?? "")) {
                update.AccessPolicies = toAccessPolicies(props.accessPolicies);
                mutated = true;
            }
            if (props.ipAddressType !== undefined &&
                props.ipAddressType !== observed.IPAddressType) {
                update.IPAddressType = props.ipAddressType;
                mutated = true;
            }
            if (props.snapshotOptions?.automatedSnapshotStartHour !== undefined &&
                props.snapshotOptions.automatedSnapshotStartHour !==
                    observed.SnapshotOptions?.AutomatedSnapshotStartHour) {
                update.SnapshotOptions = {
                    AutomatedSnapshotStartHour: props.snapshotOptions.automatedSnapshotStartHour,
                };
                mutated = true;
            }
            const desiredVpc = toVpcOptions(props.vpcOptions);
            if (desiredVpc !== undefined &&
                subsetDiffers(desiredVpc, {
                    SubnetIds: observed.VPCOptions?.SubnetIds,
                    SecurityGroupIds: observed.VPCOptions?.SecurityGroupIds,
                })) {
                update.VPCOptions = desiredVpc;
                mutated = true;
            }
            if (props.advancedOptions !== undefined &&
                subsetDiffers(props.advancedOptions, observed.AdvancedOptions)) {
                update.AdvancedOptions = props.advancedOptions;
                mutated = true;
            }
            const desiredEndpointOptions = toEndpointOptions(props.domainEndpointOptions);
            if (desiredEndpointOptions !== undefined &&
                subsetDiffers(desiredEndpointOptions, observed.DomainEndpointOptions)) {
                update.DomainEndpointOptions = desiredEndpointOptions;
                mutated = true;
            }
            // Encryption can only be enabled in place (disable = replacement,
            // handled by diff).
            if (props.encryptionAtRest !== undefined &&
                props.encryptionAtRest.enabled !== false &&
                observed.EncryptionAtRestOptions?.Enabled !== true) {
                update.EncryptionAtRestOptions = {
                    Enabled: true,
                    KmsKeyId: props.encryptionAtRest.kmsKeyId,
                };
                mutated = true;
            }
            if (props.nodeToNodeEncryption === true &&
                observed.NodeToNodeEncryptionOptions?.Enabled !== true) {
                update.NodeToNodeEncryptionOptions = { Enabled: true };
                mutated = true;
            }
            if (mutated) {
                yield* opensearch.updateDomainConfig(update);
                observed = yield* waitForActive(name);
            }
            // 3b. Engine upgrades run through the dedicated upgrade API.
            if (props.engineVersion !== undefined &&
                observed.EngineVersion !== undefined &&
                observed.EngineVersion !== props.engineVersion) {
                yield* opensearch.upgradeDomain({
                    DomainName: name,
                    TargetVersion: props.engineVersion,
                });
                observed = yield* waitForActive(name);
            }
            // 3c. Sync tags — diff against OBSERVED cloud tags.
            const observedTags = yield* readDomainTags(observed.ARN);
            const { removed, upsert } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* opensearch.addTags({ ARN: observed.ARN, TagList: upsert });
            }
            if (removed.length > 0) {
                yield* opensearch.removeTags({
                    ARN: observed.ARN,
                    TagKeys: removed,
                });
            }
            yield* session.note(name);
            return yield* toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            const name = output.domainName;
            // A domain mid-create/config-change may reject deletion — wait
            // (bounded, tolerant) for it to settle first. Already deleting
            // (or gone) is success.
            yield* repeatUntilDomainState(readDomain(name), isDomainDeletable).pipe(Effect.catch(() => Effect.succeed(undefined)));
            yield* opensearch
                .deleteDomain({ DomainName: name })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
        list: () => opensearch.listDomainNames({}).pipe(Effect.map((response) => (response.DomainNames ?? [])
            .map((info) => info.DomainName)
            .filter((name) => name !== undefined)), Effect.flatMap(Effect.forEach((name) => opensearch.describeDomain({ DomainName: name }).pipe(Effect.map((response) => response.DomainStatus), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined))), { concurrency: 4 })), Effect.map((domains) => domains.filter((domain) => domain !== undefined)), Effect.flatMap(Effect.forEach((domain) => toAttrs(domain), { concurrency: 4 }))),
    };
}));
//# sourceMappingURL=Domain.js.map