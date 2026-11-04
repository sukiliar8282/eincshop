import * as Effect from "effect/Effect";
import type { Channel } from "./Channel.ts";
import type { ChannelGroup } from "./ChannelGroup.ts";
import type { OriginEndpoint } from "./OriginEndpoint.ts";
/**
 * Shared scaffolding for AWS Elemental MediaPackage v2 HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the three
 * builders below. Everything except the operation and the IAM action list
 * is boilerplate: each builder injects the bound resource's identifying
 * names (`ChannelGroupName` / `ChannelName` / `OriginEndpointName`) into
 * every request and grants `actions` on the resource's ARN.
 *
 * Harvest-job operations authorize against the *harvest job* ARN, which is
 * the origin endpoint ARN with a `/harvestJob/{name}` suffix — set
 * `harvestJobScoped` to grant on that pattern instead of the endpoint ARN.
 */
/**
 * Build the impl Effect for a MediaPackage v2 operation scoped to a
 * {@link ChannelGroup}: the runtime callable injects the group's
 * `ChannelGroupName` and the deploy-time half grants `actions` on the
 * group ARN (plus everything beneath it — channels, endpoints, harvest
 * jobs — for list operations that enumerate child resources).
 */
export declare const makeMediaPackageV2ChannelGroupHttpBinding: <I extends {
    ChannelGroupName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MediaPackageV2.ListHarvestJobs`. */
    tag: string;
    /** The distilled operation; `ChannelGroupName` is injected from the group. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the group ARN and its child-resource pattern. */
    actions: readonly string[];
}) => Effect.Effect<<G extends ChannelGroup>(group: G) => Effect.Effect<(request?: Omit<I, "ChannelGroupName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a MediaPackage v2 operation scoped to a
 * {@link Channel}: the runtime callable injects the channel's
 * `ChannelGroupName` + `ChannelName` and the deploy-time half grants
 * `actions` on the channel ARN.
 */
export declare const makeMediaPackageV2ChannelHttpBinding: <I extends {
    ChannelGroupName: string;
    ChannelName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MediaPackageV2.ResetChannelState`. */
    tag: string;
    /** The distilled operation; the channel's names are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the channel ARN. */
    actions: readonly string[];
}) => Effect.Effect<<C extends Channel>(channel: C) => Effect.Effect<(request?: Omit<I, "ChannelGroupName" | "ChannelName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a MediaPackage v2 operation scoped to an
 * {@link OriginEndpoint}: the runtime callable injects the endpoint's
 * `ChannelGroupName` + `ChannelName` + `OriginEndpointName` and the
 * deploy-time half grants `actions` on the endpoint ARN — plus, when
 * `harvestJobScoped` is set, on the endpoint's harvest-job ARN pattern
 * (`{endpointArn}/harvestJob/*`) and the parent channel-group ARN:
 * MediaPackage authorizes `CreateHarvestJob` against the bare channel
 * group (observed live: "not authorized to perform
 * mediapackagev2:CreateHarvestJob on resource: arn:…:channelGroup/{g}").
 */
export declare const makeMediaPackageV2OriginEndpointHttpBinding: <I extends {
    ChannelGroupName: string;
    ChannelName: string;
    OriginEndpointName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MediaPackageV2.CreateHarvestJob`. */
    tag: string;
    /** The distilled operation; the endpoint's names are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the endpoint (or harvest-job pattern) ARN. */
    actions: readonly string[];
    /** Additionally grant on `{endpointArn}/harvestJob/*` (harvest-job ops). */
    harvestJobScoped?: boolean;
}) => Effect.Effect<<O extends OriginEndpoint>(endpoint: O) => Effect.Effect<(request?: Omit<I, "ChannelGroupName" | "ChannelName" | "OriginEndpointName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map