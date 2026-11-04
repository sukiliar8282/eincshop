import * as eks from "@distilled.cloud/aws/eks";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AddonProps {
    /**
     * Target cluster name.
     */
    clusterName: Input<string>;
    /**
     * Add-on name, such as `metrics-server`.
     */
    addonName: string;
    /**
     * Optional add-on version. If omitted, EKS chooses the default compatible version.
     */
    addonVersion?: string;
    /**
     * IAM role ARN used by the add-on's service account.
     */
    serviceAccountRoleArn?: Input<string>;
    /**
     * Conflict resolution strategy used during create and update.
     */
    resolveConflicts?: eks.ResolveConflicts;
    /**
     * Optional add-on configuration JSON string.
     */
    configurationValues?: string;
    /**
     * Optional pod identity associations managed by the add-on.
     */
    podIdentityAssociations?: eks.AddonPodIdentityAssociations[];
    /**
     * Optional namespace override. Changing this requires replacement.
     */
    namespaceConfig?: eks.AddonNamespaceConfigRequest;
    /**
     * Preserve the add-on installation when the Alchemy resource is deleted.
     */
    preserveOnDelete?: boolean;
    /**
     * User-defined tags to apply to the add-on.
     */
    tags?: Record<string, string>;
}
export interface Addon extends Resource<"AWS.EKS.Addon", AddonProps, {
    /** The ARN of the add-on. */
    addonArn: string;
    /** The name of the add-on (e.g. `vpc-cni`, `coredns`). */
    addonName: string;
    /** The name of the EKS cluster the add-on is installed on. */
    clusterName: string;
    /** The add-on status (e.g. `ACTIVE`, `DEGRADED`). */
    status: eks.AddonStatus;
    /** The installed version of the add-on. */
    addonVersion: string | undefined;
    /** The IAM role ARN bound to the add-on's service account, if any. */
    serviceAccountRoleArn: string | undefined;
    /** The add-on's configuration values (JSON or YAML). */
    configurationValues: string | undefined;
    /** The ARNs of the pod identity associations owned by the add-on. */
    podIdentityAssociations: string[];
    /** The Kubernetes namespace the add-on is installed in. */
    namespace: string | undefined;
    /** The publisher of the add-on. */
    publisher: string | undefined;
    /** The owner of the add-on. */
    owner: string | undefined;
    /** The tags applied to the add-on. */
    tags: Record<string, string>;
    /** Health issues currently reported for the add-on. */
    healthIssues: eks.AddonIssue[];
}, never, Providers> {
}
/**
 * An Amazon EKS managed add-on installed on a cluster.
 *
 * `Addon` is intended for optional managed add-ons. On Auto Mode clusters, many
 * core components are already provided by AWS and do not need to be modeled as
 * explicit add-on resources.
 * ### Managing Add-ons
 * **Example:** Install Metrics Server
 * ```typescript
 * const metricsServer = yield* Addon("MetricsServer", {
 *   clusterName: cluster.clusterName,
 *   addonName: "metrics-server",
 * });
 * ```
 *
 * @resource
 */
export declare const Addon: import("../../Resource.ts").ResourceClass<Addon>;
export declare const AddonProvider: () => import("effect/Layer").Layer<Provider.Provider<Addon>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Addon.d.ts.map