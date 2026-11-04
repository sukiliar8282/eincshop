import type { Credentials } from "@distilled.cloud/aws/Credentials";
import type { Region } from "@distilled.cloud/aws/Region";
import type { HttpClient } from "effect/unstable/http/HttpClient";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
declare const ReplicationSetNotActive_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ReplicationSetNotActive";
} & Readonly<A>;
/**
 * Raised when the replication set enters a terminal `FAILED` state (or does
 * not become `ACTIVE` within the bounded wait window) while reconciling.
 */
export declare class ReplicationSetNotActive extends ReplicationSetNotActive_base<{
    message: string;
    status: string;
}> {
}
export interface ReplicationSetProps {
    /**
     * The Regions that Incident Manager replicates your data to, keyed by
     * Region name. Each Region may specify a customer-managed KMS key for
     * encryption at rest via `sseKmsKeyId`; omit it to use an AWS-owned key.
     *
     * @default the ambient deployment Region with an AWS-owned key
     */
    regions?: Record<string, {
        sseKmsKeyId?: string;
    }>;
    /**
     * Whether deletion protection is enabled. When `true`, the replication set
     * cannot be deleted until protection is disabled. Alchemy automatically
     * disables protection before deleting the resource.
     *
     * @default false
     */
    deletionProtected?: boolean;
    /**
     * Tags applied to the replication set. Alchemy ownership tags are merged
     * in automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface ReplicationSet extends Resource<"AWS.SSMIncidents.ReplicationSet", ReplicationSetProps, {
    /** ARN of the replication set. */
    arn: string;
    /** Current status (`ACTIVE`, `CREATING`, `UPDATING`, `DELETING`, `FAILED`). */
    status: string;
    /** Names of the Regions in the replication set. */
    regionNames: string[];
    /** Whether deletion protection is currently enabled. */
    deletionProtected: boolean;
}, never, Providers> {
}
/**
 * The Incident Manager replication set — the account/region singleton that
 * onboards AWS Systems Manager Incident Manager. Creating it replicates and
 * encrypts Incident Manager data (response plans, incidents, contacts) to the
 * configured Regions; deleting it offboards Incident Manager and removes all
 * Incident Manager data account-wide.
 *
 * Only one replication set can exist per account, so this is a
 * capture-and-restore singleton: adopting a pre-existing replication set that
 * Alchemy did not create requires `--adopt`.
 *
 * ### Onboarding Incident Manager
 * **Example:** Replication set in the current Region
 * ```typescript
 * const replicationSet = yield* SSMIncidents.ReplicationSet("Incidents", {});
 * ```
 *
 * **Example:** Multi-Region replication with a KMS key
 * ```typescript
 * const replicationSet = yield* SSMIncidents.ReplicationSet("Incidents", {
 *   regions: {
 *     "us-east-1": {},
 *     "us-west-2": { sseKmsKeyId: key.keyArn },
 *   },
 *   deletionProtected: true,
 * });
 * ```
 */
declare const ReplicationSetResource: import("../../Resource.ts").ResourceClass<ReplicationSet>;
export { ReplicationSetResource as ReplicationSet };
type IncidentsDeps = Credentials | Region | HttpClient;
export declare const ReplicationSetProvider: () => import("effect/Layer").Layer<Provider.Provider<ReplicationSet>, never, AWSEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | IncidentsDeps>;
//# sourceMappingURL=ReplicationSet.d.ts.map