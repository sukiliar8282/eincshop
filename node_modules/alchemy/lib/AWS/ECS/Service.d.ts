import * as ecs from "@distilled.cloud/aws/ecs";
import type { Region } from "@distilled.cloud/aws/Region";
import type * as Duration from "effect/Duration";
import type { HttpClient } from "effect/unstable/http/HttpClient";
import { Platform, type Main, type PlatformProps } from "../../Platform.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { HostRuntimeContext, ServerHost } from "../../Server/Process.ts";
import { Stack } from "../../Stack.ts";
import type { Credentials } from "../Credentials.ts";
import { Listener } from "../ELBv2/Listener.ts";
import { type BundledImageSource, type DockerfileImageSource, type RegistryImageSource } from "../ECR/ImageSource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { RegionID } from "../Region.ts";
import type { Providers } from "../Providers.ts";
import type { ClusterArn } from "./Cluster.ts";
import { type TaskBindingContract, type TaskDefinitionConfig } from "./Task.ts";
export type ServiceName = string;
export type ServiceArn = `arn:aws:ecs:${RegionID}:${AccountID}:service/${string}/${ServiceName}`;
export declare const isService: (value: any) => value is Service;
/** ALB (layer-7) listener protocols. */
export type ServiceApplicationProtocol = "http" | "https";
/** NLB (layer-4) listener protocols. */
export type ServiceNetworkProtocol = "tcp" | "udp" | "tcp_udp" | "tls";
/**
 * Listener protocols supported by managed service ingress. `http`/`https`
 * compose an Application Load Balancer; `tcp`/`udp`/`tcp_udp`/`tls` compose a
 * Network Load Balancer. Mixing the two families in one service is a typed
 * error ({@link MixedLoadBalancerProtocols}).
 */
export type ServiceListenerProtocol = ServiceApplicationProtocol | ServiceNetworkProtocol;
/** A `"80/http"`-style port/protocol spec. */
export type ServiceListenSpec = `${number}/${ServiceListenerProtocol}`;
/**
 * A routing rule for the service's managed load balancer. Conditions are FLAT
 * on the rule (no `conditions: {}` wrapper) and are AND-ed together; a rule
 * with no conditions matches every request (`path: "/*"` on a shared
 * listener, or becomes the owned listener's default action).
 */
export interface ServiceLoadBalancerRule {
    /**
     * Where the rule listens. A `"80/http"`-style string means the service OWNS
     * the listener (and its ALB); an `ELBv2.Listener` reference means the rule
     * attaches to that existing (shared) listener. Omitting it falls back to
     * the config-level `listener` (shared) or the service's default owned
     * listener. Mixing owned strings and shared references within one service
     * is a typed error ({@link MixedListenerOwnership}).
     */
    listen?: ServiceListenSpec | Listener;
    /**
     * Forward matched requests to the container at this port/protocol. A target
     * group is created per distinct `forward` + `container` pair.
     * @default the main container's port
     */
    forward?: ServiceListenSpec;
    /**
     * Redirect matched requests (HTTP 301) to this port/protocol. Mutually
     * exclusive with {@link forward}.
     */
    redirect?: ServiceListenSpec;
    /**
     * Name of the container receiving traffic — the main container by default,
     * or a sidecar's container name.
     */
    container?: string;
    /** Match on the request path (`*` and `?` wildcards). */
    path?: string | string[];
    /** Match on the `Host` header (`*` and `?` wildcards). */
    host?: string | string[];
    /** Match on a named HTTP header. */
    header?: {
        name: string;
        values: string[];
    };
    /** Match on query-string key/value pairs. */
    query?: {
        key?: string;
        value: string;
    }[];
    /**
     * The rule's evaluation priority (1–50000, lower first). When omitted, a
     * deterministic priority is derived by hashing the rule's namespaced
     * logical id — stable across deploys and distinct across services. On a
     * live collision the deploy fails with a typed
     * `ListenerRulePriorityInUse` error naming the priority; set an explicit
     * `priority` to resolve it (the engine never probes for free slots).
     */
    priority?: number;
}
/** Object form of the {@link ServiceLoadBalancerConfig.domain} prop. */
export interface ServiceDomainConfig {
    /** Domain name pointed at the owned load balancer, e.g. `api.example.com`. */
    name: string;
    /**
     * Additional domain names aliased to the load balancer. Each alias gets
     * its own Route 53 alias records and (when the certificate is composed) a
     * subject alternative name on the ACM certificate.
     */
    aliases?: string[];
    /**
     * ARN of an existing ACM certificate (in the service's region) for the
     * HTTPS/TLS listener. When omitted, a DNS-validated `AWS.ACM.Certificate`
     * is composed in the matching Route 53 hosted zone.
     */
    cert?: string;
}
/**
 * Per-target-group health-check overrides, keyed by the target's
 * `"{port}/{protocol}"` spec (see {@link ServiceLoadBalancerConfig.health}).
 */
export interface ServiceTargetHealthCheck {
    /** Health-check path (HTTP/HTTPS checks). */
    path?: string;
    /** Approximate interval between checks, e.g. `"15 seconds"`. */
    interval?: Duration.Input;
    /** Time to wait for a response, e.g. `"5 seconds"`. */
    timeout?: Duration.Input;
    /** Consecutive successes before a target is healthy. */
    healthyThreshold?: number;
    /** Consecutive failures before a target is unhealthy. */
    unhealthyThreshold?: number;
    /** HTTP codes counted as healthy, e.g. `"200-299"`. */
    successCodes?: string;
}
/** Object form of the {@link ServicePropsBase.loadBalancer} prop. */
export interface ServiceLoadBalancerConfig {
    /**
     * Default (shared) listener for rules that omit `listen`. Referencing an
     * `ELBv2.Listener` means the service only creates target groups and
     * listener rules — the ALB and listener belong to whoever composed them.
     */
    listener?: Listener;
    /** Routing rules. Defaults to a single catch-all (`path: "/*"`) rule when a `listener` is referenced. */
    rules?: ServiceLoadBalancerRule[];
    /**
     * Owned-only: whether the composed ALB is internet-facing (`true`, the
     * default) or internal (`false`). A typed error on shared listeners.
     */
    public?: boolean;
    /**
     * Owned-only: point a custom domain at the composed load balancer.
     *
     * A matching Route 53 hosted zone must exist (looked up by walking the
     * domain's labels); alias A + AAAA records are composed for the domain and
     * every alias. Unless {@link ServiceDomainConfig.cert} supplies an
     * existing certificate ARN, a DNS-validated `AWS.ACM.Certificate` is
     * composed in the service's region and attached to the HTTPS listener
     * (the default listener becomes `443/https`). The service `url` prefers
     * the domain.
     */
    domain?: string | ServiceDomainConfig;
    /**
     * Per-target-group health-check overrides, keyed by the target's
     * `"{port}/{protocol}"` spec — the rule's `forward` spec, or
     * `"{containerPort}/http"` (`/tcp` for network load balancers) for the
     * default target group. Overrides the fast-converge defaults
     * (10s interval / 2 healthy / 2 unhealthy). A key matching no target
     * group is a typed error ({@link ServiceHealthTargetNotFound}).
     */
    health?: Record<string, ServiceTargetHealthCheck>;
}
/**
 * @internal Resolved managed-ingress wiring computed by the Service factory's
 * composition step — never set by hand. Carries the composed (or shared)
 * ELBv2 child-resource outputs into the core service provider.
 */
export interface ServiceManagedIngress {
    /** Whether the service owns its ALB or shares a foreign listener. */
    kind: "owned" | "shared";
    /** ARN of the (owned or shared) load balancer, for URL derivation. */
    loadBalancerArn?: string;
    /** ARN of the primary listener. */
    listenerArn?: string;
    /** Port of the primary listener. */
    listenerPort?: number;
    /** Protocol of the primary listener (`HTTP` / `HTTPS`). */
    listenerProtocol?: string;
    /** Id of the composed managed security group, when no `securityGroups` were supplied. */
    securityGroupId?: string;
    /** Custom domain pointed at the owned load balancer (URL derivation prefers it). */
    domain?: string;
    /** Target groups to wire into the ECS service definition. */
    targets: {
        /** ARN of the composed target group. */
        targetGroupArn: string;
        /** Container port receiving traffic. Defaults to the main container's port. */
        containerPort?: number;
        /** Container name receiving traffic. Defaults to the main container. */
        container?: string;
    }[];
}
declare const MixedListenerOwnership_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MixedListenerOwnership";
} & Readonly<A>;
/** Owned `"80/http"` listen strings mixed with shared `ELBv2.Listener` references in one service. */
export declare class MixedListenerOwnership extends MixedListenerOwnership_base<{
    readonly serviceId: string;
    readonly message: string;
}> {
}
declare const ServiceRuleActionConflict_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ServiceRuleActionConflict";
} & Readonly<A>;
/** A rule declared both `forward` and `redirect` (mutually exclusive). */
export declare class ServiceRuleActionConflict extends ServiceRuleActionConflict_base<{
    readonly serviceId: string;
    readonly ruleIndex: number;
    readonly message: string;
}> {
}
declare const UnsupportedListenerProtocol_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "UnsupportedListenerProtocol";
} & Readonly<A>;
/** A `listen`/`forward`/`redirect` spec used a protocol outside the supported set. */
export declare class UnsupportedListenerProtocol extends UnsupportedListenerProtocol_base<{
    readonly serviceId: string;
    readonly spec: string;
    readonly message: string;
}> {
}
declare const MissingListenerCertificate_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MissingListenerCertificate";
} & Readonly<A>;
/** An owned `https` listener was requested without a `certificateArn`. */
export declare class MissingListenerCertificate extends MissingListenerCertificate_base<{
    readonly serviceId: string;
    readonly spec: string;
    readonly message: string;
}> {
}
declare const OwnedOnlyLoadBalancerOption_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "OwnedOnlyLoadBalancerOption";
} & Readonly<A>;
/** An owned-only option (e.g. `public`) was set while sharing a foreign listener. */
export declare class OwnedOnlyLoadBalancerOption extends OwnedOnlyLoadBalancerOption_base<{
    readonly serviceId: string;
    readonly option: string;
    readonly message: string;
}> {
}
declare const MissingRuleListener_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MissingRuleListener";
} & Readonly<A>;
/** A rule has neither its own `listen` nor a config-level default `listener`. */
export declare class MissingRuleListener extends MissingRuleListener_base<{
    readonly serviceId: string;
    readonly ruleIndex: number;
    readonly message: string;
}> {
}
declare const MixedLoadBalancerProtocols_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MixedLoadBalancerProtocols";
} & Readonly<A>;
/** Application (`http`/`https`) and network (`tcp`/`udp`/`tls`/`tcp_udp`) protocols mixed in one service. */
export declare class MixedLoadBalancerProtocols extends MixedLoadBalancerProtocols_base<{
    readonly serviceId: string;
    readonly message: string;
}> {
}
declare const NetworkListenerRuleUnsupported_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "NetworkListenerRuleUnsupported";
} & Readonly<A>;
/** A network (NLB) rule used a feature NLB listeners don't support (conditions, `redirect`, shared listeners, or a missing/duplicate `listen`). */
export declare class NetworkListenerRuleUnsupported extends NetworkListenerRuleUnsupported_base<{
    readonly serviceId: string;
    readonly ruleIndex: number;
    readonly message: string;
}> {
}
declare const ServiceHostedZoneNotFound_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ServiceHostedZoneNotFound";
} & Readonly<A>;
/** No public Route 53 hosted zone matches the requested `domain`. */
export declare class ServiceHostedZoneNotFound extends ServiceHostedZoneNotFound_base<{
    readonly serviceId: string;
    readonly domainName: string;
    readonly message: string;
}> {
}
declare const ServiceHealthTargetNotFound_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ServiceHealthTargetNotFound";
} & Readonly<A>;
/** A `health` key matched none of the service's composed target groups. */
export declare class ServiceHealthTargetNotFound extends ServiceHealthTargetNotFound_base<{
    readonly serviceId: string;
    readonly key: string;
    readonly message: string;
}> {
}
declare const RequestCountScalingRequiresLoadBalancer_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "RequestCountScalingRequiresLoadBalancer";
} & Readonly<A>;
/** `scaling.requestCount` needs a managed (owned or shared) target group to track. */
export declare class RequestCountScalingRequiresLoadBalancer extends RequestCountScalingRequiresLoadBalancer_base<{
    readonly serviceId: string;
    readonly message: string;
}> {
}
declare const ServiceDidNotStabilize_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ServiceDidNotStabilize";
} & Readonly<A>;
/** An ECS service did not converge to the requested deployment before timeout. */
export declare class ServiceDidNotStabilize extends ServiceDidNotStabilize_base<{
    readonly clusterArn: string;
    readonly serviceName: string;
    readonly expectedTaskDefinitionArn: string | undefined;
    readonly status: string | undefined;
    readonly desiredCount: number | undefined;
    readonly runningCount: number | undefined;
    readonly pendingCount: number | undefined;
    readonly deploymentCount: number;
    readonly unhealthyTargetCount: number;
    readonly message: string;
}> {
}
/**
 * Derive a deterministic listener-rule priority (1–50000) from the rule's
 * namespaced logical id (FNV-1a 32-bit). Stable across deploys for the same
 * id and distinct for distinct ids; on a live `PriorityInUse` collision the
 * deploy fails with a typed error rather than probing for a free slot.
 */
export declare const deriveRulePriority: (namespacedLogicalId: string) => number;
/**
 * Autoscaling configuration for the service's desired count. Composes an
 * `AWS.ApplicationAutoScaling.ScalableTarget` plus one target-tracking
 * `ScalingPolicy` per declared metric under the service's namespace.
 */
export interface ServiceScalingConfig {
    /**
     * Minimum number of running tasks Application Auto Scaling may scale in to.
     * @default 1
     */
    min?: number;
    /**
     * Maximum number of running tasks Application Auto Scaling may scale out to.
     * @default `min`
     */
    max?: number;
    /** Target average CPU utilization (percent) to track. */
    cpuUtilization?: number;
    /** Target average memory utilization (percent) to track. */
    memoryUtilization?: number;
    /**
     * Target `ALBRequestCountPerTarget` to track. Requires a managed load
     * balancer target group ({@link ServicePropsBase.loadBalancer}) — a typed
     * error ({@link RequestCountScalingRequiresLoadBalancer}) otherwise.
     */
    requestCount?: number;
    /** Cooldown after a scale-in activity, e.g. `"5 minutes"`. */
    scaleInCooldown?: Duration.Input;
    /** Cooldown after a scale-out activity, e.g. `"1 minute"`. */
    scaleOutCooldown?: Duration.Input;
}
/**
 * Fargate capacity split for the service. `"spot"` runs everything on
 * `FARGATE_SPOT`; the object form weights on-demand (`fargate`) against
 * `spot` capacity. Normalized into
 * {@link ServicePropsBase.capacityProviderStrategy}. The cluster must have
 * the `FARGATE` / `FARGATE_SPOT` capacity providers associated (see
 * `AWS.ECS.Cluster`'s `capacityProviders` prop).
 */
export type ServiceCapacityConfig = "spot" | {
    /** On-demand Fargate share. */
    fargate?: {
        /** Baseline task count placed on this provider before weights apply. */
        base?: number;
        /** Relative share of tasks placed on this provider. */
        weight: number;
    };
    /** Fargate Spot share. */
    spot?: {
        /** Baseline task count placed on this provider before weights apply. */
        base?: number;
        /** Relative share of tasks placed on this provider. */
        weight: number;
    };
};
/**
 * Cloud Map service-discovery registration. Composes an
 * `AWS.CloudMap.Service` in the given namespace and wires it into the ECS
 * service's `serviceRegistries`.
 */
export interface ServiceRegistryConfig {
    /**
     * The Cloud Map namespace to register in — an
     * `AWS.CloudMap.PrivateDnsNamespace` or `HttpNamespace` (anything with a
     * `namespaceId`).
     */
    namespace: {
        namespaceId: string;
    };
    /**
     * SRV port to publish. When set, the composed Cloud Map service uses SRV
     * records; otherwise A records (DNS namespaces) or API-only discovery
     * (HTTP namespaces).
     */
    port?: number;
}
/** Container-level health check (Docker `HEALTHCHECK` shape) for the primary container. */
export interface ServiceContainerHealthCheck {
    /**
     * The check command, e.g.
     * `["CMD-SHELL", "curl -f http://localhost/ || exit 1"]`.
     */
    command: string[];
    /** Seconds-granularity period between checks, e.g. `"30 seconds"`. */
    interval?: Duration.Input;
    /** Time to wait for a check before counting it failed, e.g. `"5 seconds"`. */
    timeout?: Duration.Input;
    /** Consecutive failures before the container is unhealthy. */
    retries?: number;
    /** Grace period before failed checks count, e.g. `"10 seconds"`. */
    startPeriod?: Duration.Input;
}
/** Retention policy for the service's auto-created CloudWatch log group. */
export interface ServiceLoggingConfig {
    /**
     * How long to retain logs, e.g. `"2 weeks"`, or `"forever"` to clear the
     * retention policy. Rounded up to the nearest CloudWatch-supported
     * retention. When omitted the log group's existing retention is left
     * untouched (new log groups default to never-expire).
     */
    retention?: Duration.Input | "forever";
}
/** EFS volume sugar for {@link ImageOwningServicePropsBase.volumes}. */
export interface ServiceEfsVolume {
    /**
     * The EFS file system to mount — an `AWS.EFS.FileSystem` (anything with a
     * `fileSystemId`), or `{ fileSystem, accessPoint }` to mount through an
     * `AWS.EFS.AccessPoint`. Transit encryption is always enabled.
     */
    efs: {
        fileSystemId: string;
    } | {
        /** The EFS file system. */
        fileSystem: {
            fileSystemId: string;
        };
        /** Optional access point to mount through. */
        accessPoint?: {
            accessPointId: string;
        };
    };
    /** Container path to mount the file system at, e.g. `"/mnt/data"`. */
    path: string;
}
export interface ServicePropsBase extends PlatformProps {
    /**
     * ECS cluster that will own the service.
     */
    cluster: ClusterArn | {
        clusterArn: ClusterArn;
    };
    /**
     * Name of the ECS service.
     * If omitted, a unique name will be generated.
     *
     * Changing this replaces the service (delete-first).
     */
    serviceName?: string;
    /**
     * Desired number of running tasks. Updated in place.
     * @default 1
     */
    desiredCount?: number;
    /**
     * VPC that hosts the service networking and optional public ingress.
     * When omitted (together with {@link subnets}), the account's default VPC
     * is used.
     */
    vpcId?: string;
    /**
     * Subnets used by the service's awsvpc network configuration. Updated in
     * place via `updateService`. When omitted (together with {@link vpcId}),
     * the default VPC's per-AZ default subnets are used.
     */
    subnets?: string[];
    /**
     * Security groups attached to the service ENIs and any Alchemy-managed
     * load balancer. When omitted and {@link loadBalancer} is set, Alchemy
     * provisions (and owns) a security group that admits the listener port
     * from anywhere and the container port from within the group.
     */
    securityGroups?: string[];
    /**
     * Whether the service ENIs should receive public IPs.
     * @default false — but `true` when networking defaulted to the default
     * VPC (public subnets need a public IP to pull images without a NAT).
     */
    assignPublicIp?: boolean;
    /**
     * Launch type for the service. Mutually exclusive with
     * {@link capacityProviderStrategy}. Switching between launch type and
     * capacity-provider strategy replaces the service.
     * @default "FARGATE"
     */
    launchType?: ecs.LaunchType;
    /**
     * Capacity provider strategy for the service (e.g. `FARGATE`/`FARGATE_SPOT`
     * weights, or a custom ASG-backed provider). Mutually exclusive with
     * {@link launchType}. Switching to/from a launch type replaces the service;
     * weight/base changes apply in place.
     */
    capacityProviderStrategy?: ecs.CapacityProviderStrategyItem[];
    /**
     * Fargate capacity sugar: `"spot"` runs every task on `FARGATE_SPOT`, or
     * weight on-demand against spot capacity. Normalized into
     * {@link capacityProviderStrategy} (which it must not be combined with).
     * The cluster needs the Fargate capacity providers associated.
     */
    capacity?: ServiceCapacityConfig;
    /**
     * Autoscale the service's desired count: composes an Application Auto
     * Scaling scalable target (bounded by `min`/`max`) plus a target-tracking
     * policy per declared metric (`cpuUtilization`, `memoryUtilization`,
     * `requestCount`). While set, deploys stop pinning `desiredCount` so the
     * autoscaler's decisions survive redeploys.
     */
    scaling?: ServiceScalingConfig;
    /**
     * Register the service in an AWS Cloud Map namespace: composes an
     * `AWS.CloudMap.Service` and wires it into the ECS service's
     * {@link serviceRegistries}.
     */
    serviceRegistry?: ServiceRegistryConfig;
    /**
     * Load balancer target groups to wire to the service. **User-supplied** —
     * Alchemy does NOT create these. Each entry references an existing ELBv2
     * target group (or CLB) plus the container/port that receives traffic.
     * Updated in place for rolling deployments.
     *
     * For an Alchemy-managed public ALB instead, set {@link loadBalancer} to
     * `true`.
     */
    loadBalancers?: ecs.LoadBalancer[];
    /**
     * Cloud Map service registries (service discovery) to associate with the
     * service.
     */
    serviceRegistries?: ecs.ServiceRegistry[];
    /**
     * Managed load balancing for the service, composed as REAL
     * `AWS.ELBv2.LoadBalancer` / `Listener` / `TargetGroup` / `ListenerRule`
     * child resources under the service's namespace:
     *
     * - `true` — the service OWNS a public ALB with a single HTTP listener
     *   forwarding to the container port. The `url` attribute is populated
     *   from the ALB's DNS name.
     * - an `ELBv2.Listener` reference — the listener (and its ALB) are SHARED:
     *   the service only creates a target group and a catch-all
     *   (`path: "/*"`) listener rule on that listener. Destroying the service
     *   removes its rules and target groups; the shared listener/ALB are never
     *   touched.
     * - an object — `listener` (default shared listener) + `rules` (path/host/
     *   header/query routing, `forward`/`redirect` actions) + `public`
     *   (owned-only; `false` composes an internal ALB). Rules with
     *   `"80/http"`-style `listen` strings make the service own the ALB and
     *   those listeners; `ELBv2.Listener` references share existing ones.
     *   Mixing both in one service is a typed error.
     *
     * Migration note: services deployed before composed ingress recorded their
     * inline-created ALB/TG/listener/security group in the service's own
     * attributes. The first deploy under the composed shape performs a
     * breaking redeploy — new composed resources are created and the legacy
     * inline infrastructure is reaped (deleted) so nothing is stranded.
     * @default false
     */
    loadBalancer?: boolean | Listener | ServiceLoadBalancerConfig;
    /**
     * Legacy alias for {@link loadBalancer}.
     * @deprecated use `loadBalancer: true`
     */
    public?: boolean;
    /**
     * @internal Resolved managed-ingress wiring computed by the Service
     * factory's composition step. Never set by hand.
     */
    ingress?: ServiceManagedIngress;
    /**
     * Listener port for generated public ingress.
     * @default 80 when `certificateArn` is omitted, otherwise 443
     */
    listenerPort?: number;
    /**
     * ACM certificate ARN for HTTPS public ingress.
     * When provided, the generated listener uses HTTPS.
     */
    certificateArn?: string;
    /**
     * Target group health check path for public HTTP services.
     * @default "/"
     */
    healthCheckPath?: string;
    /**
     * Fargate platform version for the service. Updated in place.
     */
    platformVersion?: string;
    /**
     * Raw ECS deployment configuration (rolling update percentages, circuit
     * breaker, deployment strategy, alarms). Updated in place.
     */
    deploymentConfiguration?: ecs.DeploymentConfiguration;
    /**
     * Maximum time to wait for an ECS deployment, old-task drain, and target
     * health to converge before failing the resource operation. The provider
     * hard-caps this at 30 minutes so polling always remains bounded.
     * @default "10 minutes"
     */
    deploymentStabilizationTimeout?: Duration.Input;
    /**
     * Deployment controller (`ECS`, `CODE_DEPLOY`, `EXTERNAL`). The controller
     * type is immutable — changing it replaces the service.
     */
    deploymentController?: ecs.DeploymentController;
    /**
     * Placement constraints (`distinctInstance` / `memberOf`). Updated in place.
     */
    placementConstraints?: ecs.PlacementConstraint[];
    /**
     * Placement strategy (`random` / `spread` / `binpack`). Updated in place.
     */
    placementStrategy?: ecs.PlacementStrategy[];
    /**
     * Scheduling strategy. `REPLICA` runs and maintains `desiredCount` copies;
     * `DAEMON` runs one task per eligible instance. Immutable — changing it
     * replaces the service.
     * @default "REPLICA"
     */
    schedulingStrategy?: ecs.SchedulingStrategy;
    /**
     * Whether to enable ECS Exec on the service tasks. Updated in place.
     * @default false
     */
    enableExecuteCommand?: boolean;
    /**
     * Whether to enable ECS managed tags. Immutable post-create.
     * @default true
     */
    enableECSManagedTags?: boolean;
    /**
     * How to propagate tags to tasks (`TASK_DEFINITION`, `SERVICE`, `NONE`).
     * Updated in place.
     */
    propagateTags?: ecs.PropagateTags;
    /**
     * Availability zone rebalancing behavior. Updated in place.
     */
    availabilityZoneRebalancing?: ecs.AvailabilityZoneRebalancing;
    /**
     * ECS Service Connect configuration. Updated in place.
     */
    serviceConnectConfiguration?: ecs.ServiceConnectConfiguration;
    /**
     * Service-managed volume configurations. Updated in place.
     */
    volumeConfigurations?: ecs.ServiceVolumeConfiguration[];
    /**
     * IAM role for the ELB integration (only for non-awsvpc / CLB services).
     * Immutable — changing it replaces the service.
     */
    role?: string;
    /**
     * Grace period before ECS starts evaluating target health checks, e.g.
     * `"30 seconds"` or `Duration.seconds(30)`. Rounded to whole seconds on
     * the wire. Updated in place.
     */
    healthCheckGracePeriod?: Duration.Input;
    /**
     * User-defined tags to apply to the ECS service and generated ingress
     * resources. Reconciled in place against observed service tags.
     */
    tags?: Record<string, string>;
}
/**
 * Deploy an existing `AWS.ECS.Task`'s definition as a service (shared
 * image/roles/config; the Service adds `desiredCount` / load balancing /
 * deployment configuration).
 */
export interface TaskReferenceServiceProps extends ServicePropsBase {
    /**
     * Bundled ECS task to run for each service replica: the runtime-facing
     * subset of `AWS.ECS.Task` attributes the service needs to deploy and
     * wire load balancer traffic (a full `Task` satisfies it structurally).
     */
    task: {
        /**
         * Registered task definition ARN to deploy.
         */
        taskDefinitionArn: string;
        /**
         * Container name inside the task definition that should receive traffic.
         */
        containerName: string;
        /**
         * Container port that the service should expose and forward traffic to.
         */
        port: number;
    };
}
/**
 * Image-owning base: the Service synthesizes its own task definition
 * (roles, log group, ECR repository, image) from the shared
 * {@link TaskDefinitionConfig} surface.
 */
export interface ImageOwningServicePropsBase extends ServicePropsBase, Omit<TaskDefinitionConfig, "placementConstraints" | "volumes"> {
    /**
     * Task definition placement constraints (`memberOf` expressions) for the
     * synthesized task definition. (`placementConstraints` on the service
     * itself remains the service-level ECS placement constraint list.)
     */
    taskPlacementConstraints?: ecs.TaskDefinitionPlacementConstraint[];
    /**
     * Secrets injected into the primary container as environment variables:
     * env-var name → SSM Parameter Store parameter ARN or Secrets Manager
     * secret ARN. Wired as container `secrets` (`valueFrom`), with the
     * execution role granted `ssm:GetParameters` /
     * `secretsmanager:GetSecretValue` on exactly the referenced ARNs.
     */
    secrets?: Record<string, string>;
    /**
     * Retention for the auto-created CloudWatch log group, e.g.
     * `{ retention: "2 weeks" }` or `{ retention: "forever" }`.
     */
    logging?: ServiceLoggingConfig;
    /**
     * Container-level health check (Docker `HEALTHCHECK`) for the primary
     * container, e.g.
     * `{ command: ["CMD-SHELL", "curl -f http://localhost/ || exit 1"] }`.
     */
    healthCheck?: ServiceContainerHealthCheck;
    /**
     * Task-level data volumes. Accepts raw {@link ecs.Volume} entries
     * (referenced by the container via `mountPoints`) or the EFS sugar
     * `{ efs, path }`, which composes the volume AND mounts it at `path` on
     * the primary container with transit encryption enabled.
     */
    volumes?: (ecs.Volume | ServiceEfsVolume)[];
}
/** Bundle an inline Effect program (`main`) into the service's image. */
export interface BundledServiceProps extends ImageOwningServicePropsBase, BundledImageSource {
}
/** Build the user's own Dockerfile into the service's image. */
export interface DockerfileServiceProps extends ImageOwningServicePropsBase, DockerfileImageSource {
}
/** Run a pre-built registry image, mirrored into ECR. */
export interface ImageServiceProps extends ImageOwningServicePropsBase, RegistryImageSource {
}
/**
 * Service props — either reference an existing task definition (`task:`) or
 * own the image via exactly one of `main` / `context` / `image` (the
 * Service then synthesizes its own task definition).
 */
export type ServiceProps = TaskReferenceServiceProps | BundledServiceProps | DockerfileServiceProps | ImageServiceProps;
export interface Service extends Resource<"AWS.ECS.Service", ServiceProps, {
    /**
     * ARN of the ECS service.
     */
    serviceArn: ServiceArn;
    /**
     * Name of the ECS service.
     */
    serviceName: ServiceName;
    /**
     * ARN of the cluster that owns the service.
     */
    clusterArn: ClusterArn;
    /**
     * Task definition revision currently deployed by the service.
     */
    taskDefinitionArn: string;
    /**
     * ECS service status such as `ACTIVE` or `DRAINING`.
     */
    status: string;
    /**
     * URL of the service through its managed ingress. Owned load balancers
     * use the composed ALB's DNS name; shared listeners derive it from the
     * foreign listener's ALB DNS + protocol/port (best-effort — undefined
     * when not derivable).
     */
    url?: string;
    /**
     * ARN of the load balancer serving the service's managed ingress (the
     * composed ALB when owned; the shared listener's ALB otherwise).
     */
    loadBalancerArn?: string;
    /**
     * ARN of the first managed target group, when `loadBalancer` is set.
     */
    targetGroupArn?: string;
    /**
     * ARN of the primary listener, when `loadBalancer` is set.
     */
    listenerArn?: string;
    /**
     * Id of the Alchemy-managed security group composed for managed ingress
     * (only when `loadBalancer` is set and no `securityGroups` supplied).
     */
    securityGroupId?: string;
    /**
     * @internal Marks attrs written by the composed-ingress shape ("owned" |
     * "shared"). Absent on legacy state rows whose ALB/TG/listener were
     * created inline by the provider — the marker gates the migration reap
     * and the legacy delete path.
     */
    ingressKind?: "owned" | "shared";
    /** Family of the synthesized task definition (image-owning form only). */
    taskFamily?: string;
    /** Name of the primary container (image-owning form only). */
    containerName?: string;
    /** Container port receiving traffic (image-owning form only). */
    port?: number;
    /** Image URI the synthesized task definition runs. */
    imageUri?: string;
    /** ECR repository name holding the service's image. */
    repositoryName?: string;
    /** ECR repository URI holding the service's image. */
    repositoryUri?: string;
    /** ARN of the synthesized task role. */
    taskRoleArn?: string;
    /** Name of the synthesized task role. */
    taskRoleName?: string;
    /** ARN of the synthesized execution role. */
    executionRoleArn?: string;
    /** Name of the synthesized execution role. */
    executionRoleName?: string;
    /** CloudWatch log group of the synthesized task definition. */
    logGroupName?: string;
    /** ARN of the CloudWatch log group. */
    logGroupArn?: string;
    /** Content hash of the service's container image. */
    code?: {
        /** Content hash of the service's container image. */
        hash: string;
    };
}, TaskBindingContract, Providers> {
}
export type ServiceServices = Credentials | Region | ServerHost | AWSEnvironment;
/**
 * The impl shape for an effectful `Service`: a long-running server returning
 * `{ fetch }` (plus optional RPC methods).
 */
export type ServiceShape = Main<ServiceServices>;
export interface ServiceRuntimeContext extends HostRuntimeContext {
    readonly Type: "AWS.ECS.Service";
}
/**
 * An ECS service: N copies of a container kept alive, optionally behind a
 * load balancer.
 *
 * The service's image comes from one of four sources:
 *
 * - `image` — run a pre-built registry image, mirrored into ECR.
 * - `context` — build your own Dockerfile.
 * - `main` — bundle an inline Effect program (servers return `{ fetch }`).
 * - `task:` — deploy an existing `AWS.ECS.Task`'s definition; the Service
 *   adds `desiredCount` / load balancing / deployment configuration.
 *
 * With any of the first three the Service synthesizes its own task
 * definition (task + execution roles, log group, ECR repository).
 * `loadBalancer: true` wires a public ALB + target group + listener and
 * populates the `url` attribute. When `vpcId`/`subnets` are omitted the
 * account's default VPC (and its per-AZ subnets) is used.
 *
 * Most configuration is updated **in place** via `updateService`
 * (desiredCount, task definition, network, deployment config, placement,
 * exec, load balancers, tags). Only truly-immutable aspects — `serviceName`,
 * `cluster`, launchType↔capacityProviderStrategy switch, `deploymentController`
 * type, `schedulingStrategy`, `enableECSManagedTags`, `role` — replace the
 * service.
 * ### Creating Services
 * **Example:** Remote Image Behind a Load Balancer
 * ```typescript
 * const nginx = yield* Service("Edge", {
 *   cluster,
 *   image: "public.ecr.aws/nginx/nginx:1.27",
 *   port: 80,
 *   desiredCount: 2,
 *   loadBalancer: true,   // ALB + target group + listener wiring
 * });
 * nginx.url; // http://<alb-dns-name>
 * ```
 *
 * **Example:** Run an Existing Task's Definition
 * ```typescript
 * const api = yield* Service("Api", {
 *   cluster,
 *   task: apiTask,        // shared image/roles/config; Service adds
 *   desiredCount: 2,      // desiredCount / LB / deployment config
 *   loadBalancer: true,
 * });
 * ```
 *
 * **Example:** Inline Effect Server
 * ```typescript
 * const api = yield* Service(
 *   "Api",
 *   { cluster, main: import.meta.url, port: 3000, desiredCount: 2, cpu: 256, memory: 512 },
 *   Effect.gen(function* () {
 *     const putItem = yield* AWS.DynamoDB.PutItem(table);
 *     return {
 *       fetch: Effect.gen(function* () {
 *         return yield* HttpServerResponse.json({ ok: true });
 *       }),
 *     };
 *   }).pipe(Effect.provide(AWS.DynamoDB.PutItemHttp)),
 * );
 * ```
 *
 * ### Bundling & Tree-shaking
 * `main` is bundled with rolldown at deploy time. Unused code is
 * tree-shaken. `effect`, alchemy, and `@distilled.cloud` are marked
 * pure so unused parts prune more aggressively. Your app is not
 * marked pure.
 *
 * **Example:** Mark additional packages as pure
 * Only list packages with no top-level side effects.
 * ```typescript
 * {
 *   main: import.meta.url,
 *   build: {
 *     pure: { packages: ["my-lib", "@my-scope/*"] },
 *   },
 * }
 * ```
 *
 * **Example:** Turn it off
 * ```typescript
 * {
 *   main: import.meta.url,
 *   build: { pure: false },
 * }
 * ```
 *
 * ### Shared Load Balancers
 * **Example:** Two Services Sharing One Listener
 * ```typescript
 * // The ALB + listener are stack-level resources owned by neither service.
 * const lb = yield* AWS.ELBv2.LoadBalancer("Alb", {
 *   subnets: [subnetA.subnetId, subnetB.subnetId],
 *   securityGroups: [sg.groupId],
 * });
 * const listener = yield* AWS.ELBv2.Listener("Http", {
 *   loadBalancerArn: lb.loadBalancerArn,
 *   port: 80,
 *   defaultActions: [
 *     { type: "fixedResponse", statusCode: "404", messageBody: "no route" },
 *   ],
 * });
 *
 * // Each service composes only its own TargetGroup + ListenerRule on the
 * // shared listener. Destroying one service removes its rule + target
 * // group; the ALB, listener, and the other service are untouched.
 * const api = yield* Service("Api", {
 *   cluster,
 *   image: "my-org/api:latest",
 *   port: 3000,
 *   loadBalancer: { listener, rules: [{ path: "/api/*" }] },
 * });
 * const web = yield* Service("Web", {
 *   cluster,
 *   image: "my-org/web:latest",
 *   port: 8080,
 *   loadBalancer: { listener, rules: [{ path: "/*" }] },
 * });
 * ```
 *
 * **Example:** Catch-All on a Shared Listener
 * ```typescript
 * // A bare listener reference adds a single `path: "/*"` rule.
 * const svc = yield* Service("Svc", {
 *   cluster,
 *   image: "my-org/web:latest",
 *   port: 8080,
 *   loadBalancer: listener,
 * });
 * ```
 *
 * **Example:** Owned ALB with Routing Rules and an HTTP → HTTPS Redirect
 * ```typescript
 * // `"80/http"`-style `listen` strings mean the service OWNS the ALB and
 * // these listeners (mixing them with shared listener references is a
 * // typed error).
 * const svc = yield* Service("Svc", {
 *   cluster,
 *   image: "my-org/web:latest",
 *   port: 8080,
 *   certificateArn,
 *   loadBalancer: {
 *     rules: [
 *       { listen: "80/http", redirect: "443/https" },
 *       { listen: "443/https", forward: "8080/http" },
 *     ],
 *   },
 * });
 * ```
 *
 * ### Custom Domains
 * **Example:** Domain with a Composed Certificate
 * ```typescript
 * // Looks up the matching Route 53 hosted zone, composes a DNS-validated
 * // ACM certificate in the service's region, wires it to the HTTPS
 * // listener, and creates alias A/AAAA records. `url` becomes
 * // https://api.example.com.
 * const svc = yield* Service("Api", {
 *   cluster,
 *   image: "my-org/api:latest",
 *   port: 3000,
 *   loadBalancer: { domain: "api.example.com" },
 * });
 * ```
 *
 * **Example:** Domain with an Existing Certificate
 * ```typescript
 * const svc = yield* Service("Api", {
 *   cluster,
 *   image: "my-org/api:latest",
 *   port: 3000,
 *   loadBalancer: {
 *     domain: { name: "api.example.com", aliases: ["www.api.example.com"], cert: certificateArn },
 *   },
 * });
 * ```
 *
 * ### Network Load Balancers
 * **Example:** TCP Service Behind an NLB
 * ```typescript
 * // tcp/udp/tls/tcp_udp listen protocols compose a Network Load Balancer;
 * // each rule's action becomes its listener's default forward (NLB
 * // listeners route by port alone).
 * const svc = yield* Service("Tcp", {
 *   cluster,
 *   image: "my-org/tcp-echo:latest",
 *   port: 9000,
 *   loadBalancer: { rules: [{ listen: "80/tcp" }] },
 * });
 * ```
 *
 * ### Health Checks
 * **Example:** Per-Target-Group Health Overrides
 * ```typescript
 * const svc = yield* Service("Api", {
 *   cluster,
 *   image: "my-org/api:latest",
 *   port: 3000,
 *   loadBalancer: {
 *     rules: [{ listen: "80/http" }],
 *     health: {
 *       "3000/http": {
 *         path: "/healthz",
 *         interval: "15 seconds",
 *         healthyThreshold: 3,
 *         successCodes: "200-299",
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Container Health Check
 * ```typescript
 * const svc = yield* Service("Api", {
 *   cluster,
 *   image: "my-org/api:latest",
 *   port: 3000,
 *   healthCheck: {
 *     command: ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"],
 *     interval: "30 seconds",
 *     retries: 3,
 *   },
 * });
 * ```
 *
 * ### Autoscaling
 * **Example:** Target-Tracking Autoscaling
 * ```typescript
 * // Composes a ScalableTarget (min/max) plus one target-tracking policy
 * // per metric. Redeploys stop pinning desiredCount while scaling is set.
 * const svc = yield* Service("Api", {
 *   cluster,
 *   image: "my-org/api:latest",
 *   port: 3000,
 *   loadBalancer: true,
 *   scaling: {
 *     min: 1,
 *     max: 4,
 *     cpuUtilization: 70,
 *     requestCount: 200,
 *     scaleInCooldown: "5 minutes",
 *   },
 * });
 * ```
 *
 * ### Secrets & Logging
 * **Example:** Inject SSM / Secrets Manager Secrets
 * ```typescript
 * // Values are ARNs; the container gets them as env vars via `valueFrom`
 * // and the execution role is granted read on exactly these ARNs.
 * const svc = yield* Service("Api", {
 *   cluster,
 *   image: "my-org/api:latest",
 *   port: 3000,
 *   secrets: {
 *     DB_PASSWORD: dbPasswordSecret.secretArn,
 *     API_KEY: apiKeyParameter.parameterArn,
 *   },
 *   logging: { retention: "2 weeks" },
 * });
 * ```
 *
 * ### Service Discovery
 * **Example:** Register in a Cloud Map Namespace
 * ```typescript
 * const namespace = yield* AWS.CloudMap.PrivateDnsNamespace("AppNs", {
 *   name: "internal.example.com",
 *   vpc: vpc.vpcId,
 * });
 * const svc = yield* Service("Api", {
 *   cluster,
 *   image: "my-org/api:latest",
 *   port: 3000,
 *   serviceRegistry: { namespace },
 * });
 * ```
 *
 * ### Volumes
 * **Example:** Mount an EFS File System
 * ```typescript
 * const svc = yield* Service("Api", {
 *   cluster,
 *   image: "my-org/api:latest",
 *   port: 3000,
 *   volumes: [{ efs: fileSystem, path: "/mnt/data" }],
 * });
 * ```
 *
 * ### Capacity
 * **Example:** Fargate Spot
 * ```typescript
 * // The cluster must have the Fargate capacity providers associated:
 * // Cluster("C", { capacityProviders: ["FARGATE", "FARGATE_SPOT"] }).
 * const svc = yield* Service("Worker", {
 *   cluster,
 *   image: "my-org/worker:latest",
 *   capacity: { fargate: { weight: 1, base: 1 }, spot: { weight: 4 } },
 * });
 * ```
 *
 * ### Load Balancing
 * **Example:** Manual (User-Supplied) Target Group
 * ```typescript
 * const service = yield* Service("ApiService", {
 *   cluster,
 *   task: apiTask,
 *   vpcId: vpc.vpcId,
 *   subnets: [subnet1.subnetId, subnet2.subnetId],
 *   loadBalancers: [
 *     {
 *       targetGroupArn,
 *       containerName: apiTask.containerName,
 *       containerPort: apiTask.port,
 *     },
 *   ],
 * });
 * ```
 *
 * ### Capacity & Placement
 * **Example:** FARGATE_SPOT Capacity Provider Strategy
 * ```typescript
 * const service = yield* Service("WorkerService", {
 *   cluster,
 *   task: workerTask,
 *   vpcId: vpc.vpcId,
 *   subnets: [subnet.subnetId],
 *   capacityProviderStrategy: [
 *     { capacityProvider: "FARGATE_SPOT", weight: 4 },
 *     { capacityProvider: "FARGATE", weight: 1, base: 1 },
 *   ],
 *   placementStrategy: [{ type: "spread", field: "attribute:ecs.availability-zone" }],
 * });
 * ```
 *
 * ### Deployment
 * **Example:** Rolling Update with Circuit Breaker
 * ```typescript
 * const service = yield* Service("ApiService", {
 *   cluster,
 *   task: apiTask,
 *   vpcId: vpc.vpcId,
 *   subnets: [subnet1.subnetId, subnet2.subnetId],
 *   desiredCount: 3,
 *   enableExecuteCommand: true,
 *   deploymentConfiguration: {
 *     minimumHealthyPercent: 100,
 *     maximumPercent: 200,
 *     deploymentCircuitBreaker: { enable: true, rollback: true },
 *   },
 *   healthCheckGracePeriod: "30 seconds",
 * });
 * ```
 *
 * @resource
 */
export declare const Service: Platform<Service, ServiceServices, ServiceShape, ServiceRuntimeContext>;
type ServiceConvergenceDependencies = Credentials | HttpClient | Region;
export declare const ServiceProvider: () => import("effect/Layer").Layer<Provider.Provider<Service>, never, AWSEnvironment | import("../../AlchemyContext.ts").AlchemyContext | import("../../Docker/Docker.ts").Docker | import("effect/FileSystem").FileSystem | import("effect/Path").Path | Stack | import("../../Stage.ts").Stage | ServiceConvergenceDependencies>;
export {};
//# sourceMappingURL=Service.d.ts.map