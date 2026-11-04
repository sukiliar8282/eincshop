import * as analytics from "@distilled.cloud/aws/kinesis-analytics-v2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type SnapshotStatus = analytics.SnapshotStatus;
export interface ApplicationSnapshotProps {
    /**
     * Name of the Managed Service for Apache Flink application to snapshot.
     * The application must be `RUNNING` with snapshots enabled. Changing the
     * application replaces the snapshot.
     */
    applicationName: string;
    /**
     * Name of the snapshot. Changing the name replaces the snapshot.
     * @default ${app}-${id}-${stage}-${instanceId}
     */
    snapshotName?: string;
}
export interface ApplicationSnapshot extends Resource<"AWS.KinesisAnalyticsV2.ApplicationSnapshot", ApplicationSnapshotProps, {
    /**
     * Name of the application the snapshot belongs to.
     */
    applicationName: string;
    /**
     * Physical name of the snapshot.
     */
    snapshotName: string;
    /**
     * Current status of the snapshot.
     */
    snapshotStatus: SnapshotStatus;
    /**
     * Application version the snapshot was taken from.
     */
    applicationVersionId: number;
}, never, Providers> {
}
/**
 * A snapshot (Flink savepoint) of a running Managed Service for Apache
 * Flink application's state.
 *
 * Snapshots are immutable — every prop change replaces the snapshot. The
 * source application must be `RUNNING` with `snapshotsEnabled: true` when
 * the snapshot is created.
 * ### Creating Snapshots
 * **Example:** Snapshot a running application
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const app = yield* AWS.KinesisAnalyticsV2.Application("Enrichment", {
 *   runtimeEnvironment: "FLINK-1_20",
 *   code: { bucketArn: bucket.bucketArn, fileKey: "jobs/enrichment-1.0.jar" },
 *   snapshotsEnabled: true,
 *   start: true,
 * });
 * const snapshot = yield* AWS.KinesisAnalyticsV2.ApplicationSnapshot(
 *   "Checkpoint",
 *   { applicationName: app.applicationName },
 * );
 * ```
 *
 * @resource
 */
export declare const ApplicationSnapshot: import("../../Resource.ts").ResourceClass<ApplicationSnapshot>;
declare const SnapshotFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SnapshotFailed";
} & Readonly<A>;
/**
 * The snapshot entered `FAILED` (or vanished) while waiting for `READY`.
 */
export declare class SnapshotFailed extends SnapshotFailed_base<{
    readonly applicationName: string;
    readonly snapshotName: string;
    readonly status: string;
}> {
}
export declare const ApplicationSnapshotProvider: () => import("effect/Layer").Layer<Provider.Provider<ApplicationSnapshot>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=ApplicationSnapshot.d.ts.map