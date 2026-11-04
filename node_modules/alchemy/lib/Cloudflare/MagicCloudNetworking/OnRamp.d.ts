import * as mcn from "@distilled.cloud/cloudflare/magic-cloud-networking";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.MagicCloudNetworking.OnRamp";
type TypeId = typeof TypeId;
/**
 * The cloud provider an on-ramp connects to Magic WAN.
 */
export type OnRampCloudType = "AWS" | "AZURE" | "GOOGLE";
/**
 * Topology of an on-ramp: a single VPC/VNet, or a hub (e.g. AWS Transit
 * Gateway) with attached VPCs.
 */
export type OnRampType = "OnrampTypeSingle" | "OnrampTypeHub";
export interface OnRampProps {
    /**
     * The cloud provider this on-ramp connects to.
     *
     * Immutable — changing the cloud type triggers a replacement.
     */
    cloudType: OnRampCloudType;
    /**
     * Topology of the on-ramp: `OnrampTypeSingle` connects one VPC/VNet,
     * `OnrampTypeHub` provisions a hub (e.g. AWS Transit Gateway) that VPCs
     * attach to.
     *
     * Immutable — changing the topology triggers a replacement.
     */
    type: OnRampType;
    /**
     * Enables BGP routing. When enabled, set both `installRoutesInCloud` and
     * `installRoutesInMagicWan` to `false`.
     *
     * Immutable — the API offers no way to change it, so a change triggers a
     * replacement.
     */
    dynamicRouting: boolean;
    /**
     * Whether Cloudflare installs Magic WAN routes into the cloud route
     * tables. Mutable.
     */
    installRoutesInCloud: boolean;
    /**
     * Whether routes to the cloud networks are installed in Magic WAN.
     * Mutable.
     */
    installRoutesInMagicWan: boolean;
    /**
     * Human readable name. Used as the on-ramp's identity for cold-state
     * recovery, so it should be unique within the account. If omitted, a
     * unique name is generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Cloud region the on-ramp is provisioned in (e.g. `us-east-1`).
     *
     * Immutable — changing the region triggers a replacement.
     */
    region?: string;
    /**
     * The discovered VPC/VNet resource id to connect
     * (`type: "OnrampTypeSingle"`). Mutable.
     */
    vpc?: string;
    /**
     * Cloud-side ASN for BGP. If unset or zero, the cloud's default ASN
     * takes effect.
     *
     * Immutable — the API offers no way to change it, so a change triggers a
     * replacement.
     */
    cloudAsn?: number;
    /**
     * Free-form description of the on-ramp. Mutable.
     */
    description?: string;
    /**
     * Adopt an existing hub (e.g. an existing Transit Gateway) instead of
     * provisioning one (`type: "OnrampTypeHub"`).
     *
     * Immutable — hub identity cannot change, so a change triggers a
     * replacement.
     */
    adoptedHubId?: string;
    /**
     * Cloud integration that owns the hub when it lives in a different
     * provider account.
     *
     * Immutable — hub identity cannot change, so a change triggers a
     * replacement.
     */
    hubProviderId?: string;
    /**
     * Hubs attached to this on-ramp. Mutable.
     */
    attachedHubs?: string[];
    /**
     * VPCs attached to this hub on-ramp (`type: "OnrampTypeHub"`). Mutable.
     */
    attachedVpcs?: string[];
    /**
     * Whether Cloudflare manages hub-to-hub attachments. Mutable.
     */
    manageHubToHubAttachments?: boolean;
    /**
     * Whether Cloudflare manages VPC-to-hub attachments. Mutable.
     */
    manageVpcToHubAttachments?: boolean;
    /**
     * Whether deleting the on-ramp also destroys the cloud-side resources it
     * provisioned (VPN gateways, Transit Gateway, …). Consumed only at
     * delete time.
     * @default false
     */
    destroyOnDelete?: boolean;
}
export interface OnRampAttributes {
    /** Cloudflare-assigned identifier of the on-ramp. */
    onRampId: string;
    /** The Cloudflare account the on-ramp belongs to. */
    accountId: string;
    /** Human readable name of the on-ramp. */
    name: string;
    /** The cloud provider this on-ramp connects to. */
    cloudType: OnRampCloudType;
    /** Topology of the on-ramp. */
    type: OnRampType;
    /** Whether BGP routing is enabled. */
    dynamicRouting: boolean;
    /** Whether Magic WAN routes are installed into the cloud route tables. */
    installRoutesInCloud: boolean;
    /** Whether cloud routes are installed in Magic WAN. */
    installRoutesInMagicWan: boolean;
    /** The connected VPC/VNet resource id, if set. */
    vpc: string | undefined;
    /** Cloud-side ASN, if set. */
    cloudAsn: number | undefined;
    /** Free-form description, if set. */
    description: string | undefined;
    /** Hubs attached to this on-ramp. */
    attachedHubs: string[];
    /** VPCs attached to this hub on-ramp. */
    attachedVpcs: string[];
    /** Whether Cloudflare manages hub-to-hub attachments, if reported. */
    manageHubToHubAttachments: boolean | undefined;
    /** Whether Cloudflare manages VPC-to-hub attachments, if reported. */
    manageVpcToHubAttachments: boolean | undefined;
    /** ISO8601 timestamp of the last change to the on-ramp. */
    updatedAt: string;
    /** Whether delete also destroys provisioned cloud-side resources. */
    destroyOnDelete: boolean;
}
export type OnRamp = Resource<TypeId, OnRampProps, OnRampAttributes, never, Providers>;
/**
 * A Magic Cloud Networking on-ramp — connects cloud VPCs/VNets to Magic WAN
 * by provisioning VPN/Transit-Gateway constructs inside the cloud account
 * registered via a `CloudIntegration`.
 *
 * On-ramps are heavily eventually consistent: after create/update the
 * on-ramp goes through plan/apply phases that provision real cloud
 * infrastructure (minutes). This resource creates and patches the on-ramp
 * configuration and returns immediately; the apply lifecycle is driven by
 * Cloudflare.
 *
 * `name`, `description`, `vpc`, route-installation flags, and attachments
 * are patched in place; `cloudType`, `type`, `dynamicRouting`, `region`,
 * `cloudAsn`, and hub identity force a replacement.
 *
 * Magic Cloud Networking is an entitlement-gated add-on (Magic WAN family).
 * On accounts without the entitlement every API call fails with the typed
 * `FeatureNotEnabled` error (Cloudflare code 1012, "feature not enabled").
 * ### Connecting a single VPC
 * **Example:** AWS VPC on-ramp
 * ```typescript
 * const onramp = yield* Cloudflare.MagicCloudNetworking.OnRamp("ProdVpc", {
 *   cloudType: "AWS",
 *   type: "OnrampTypeSingle",
 *   region: "us-east-1",
 *   vpc: discoveredVpcId,
 *   dynamicRouting: false,
 *   installRoutesInCloud: true,
 *   installRoutesInMagicWan: true,
 * });
 * ```
 *
 * ### Hub topologies
 * **Example:** Transit Gateway hub with attached VPCs
 * ```typescript
 * yield* Cloudflare.MagicCloudNetworking.OnRamp("TgwHub", {
 *   cloudType: "AWS",
 *   type: "OnrampTypeHub",
 *   region: "us-east-1",
 *   dynamicRouting: true,
 *   installRoutesInCloud: false,
 *   installRoutesInMagicWan: false,
 *   attachedVpcs: [vpcA, vpcB],
 *   manageVpcToHubAttachments: true,
 * });
 * ```
 *
 * ### Destroy behavior
 * **Example:** Tear down cloud-side resources on destroy
 * ```typescript
 * yield* Cloudflare.MagicCloudNetworking.OnRamp("ProdVpc", {
 *   cloudType: "AWS",
 *   type: "OnrampTypeSingle",
 *   region: "us-east-1",
 *   vpc: discoveredVpcId,
 *   dynamicRouting: false,
 *   installRoutesInCloud: true,
 *   installRoutesInMagicWan: true,
 *   destroyOnDelete: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-cloud-networking/
 *
 * @resource
 * @product Magic Cloud Networking
 * @category Network
 */
export declare const OnRamp: import("../../Resource.ts").ResourceClass<OnRamp>;
/**
 * Returns true if the given value is an OnRamp resource.
 */
export declare const isOnRamp: (value: unknown) => value is OnRamp;
export declare const OnRampProvider: () => import("effect/Layer").Layer<Provider.Provider<OnRamp>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | mcn.CloudflareOpContext>;
export {};
//# sourceMappingURL=OnRamp.d.ts.map