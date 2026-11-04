import * as datasync from "@distilled.cloud/aws/datasync";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags } from "../../Tags.js";
import { readObservedTags, retryWhileRoleNotAssumable, syncTags, } from "./internal.js";
/**
 * A DataSync location backed by an Amazon EFS file system. Used as a source
 * or destination endpoint of a {@link Task}.
 *
 * EFS locations are immutable apart from their tags: any change to the file
 * system, subnet, security groups, subdirectory, access point, or encryption
 * replaces the location.
 *
 * ### Creating EFS Locations
 * **Example:** File system + subnet + security group
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const location = yield* AWS.DataSync.LocationEfs("Files", {
 *   efsFilesystemArn: files.fileSystemArn,
 *   subnetArn: `arn:aws:ec2:${region}:${accountId}:subnet/${subnetId}`,
 *   securityGroupArns: [
 *     `arn:aws:ec2:${region}:${accountId}:security-group/${sgId}`,
 *   ],
 * });
 * ```
 *
 * ### Transferring Data
 * **Example:** Back up EFS to S3
 * ```typescript
 * const dest = yield* AWS.DataSync.LocationS3("Backups", {
 *   s3BucketArn: bucket.bucketArn,
 *   bucketAccessRoleArn: role.roleArn,
 * });
 *
 * const task = yield* AWS.DataSync.Task("EfsBackup", {
 *   sourceLocationArn: location.locationArn,
 *   destinationLocationArn: dest.locationArn,
 *   schedule: { ScheduleExpression: "cron(0 2 * * ? *)" },
 * });
 * ```
 *
 * @resource
 */
export const LocationEfs = Resource("AWS.DataSync.LocationEfs");
export const LocationEfsProvider = () => Provider.effect(LocationEfs, Effect.gen(function* () {
    const describe = Effect.fn(function* (locationArn) {
        return yield* datasync
            .describeLocationEfs({ LocationArn: locationArn })
            .pipe(Effect.catchTag("LocationNotFound", () => Effect.succeed(undefined)));
    });
    return LocationEfs.Provider.of({
        stables: ["locationArn", "locationUri"],
        list: () => datasync.listLocations.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            .flatMap((p) => p.Locations ?? [])
            .filter((l) => l.LocationUri?.startsWith("efs://"))
            .map((l) => ({
            locationArn: l.LocationArn,
            locationUri: l.LocationUri,
        })))),
        read: Effect.fn(function* ({ output }) {
            if (output?.locationArn === undefined)
                return undefined;
            const loc = yield* describe(output.locationArn);
            if (loc === undefined)
                return undefined;
            return {
                locationArn: loc.LocationArn,
                locationUri: loc.LocationUri,
            };
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            const replaced = news.efsFilesystemArn !== olds.efsFilesystemArn ||
                news.subnetArn !== olds.subnetArn ||
                JSON.stringify(news.securityGroupArns) !==
                    JSON.stringify(olds.securityGroupArns) ||
                (news.subdirectory ?? "/") !== (olds.subdirectory ?? "/") ||
                news.accessPointArn !== olds.accessPointArn ||
                news.fileSystemAccessRoleArn !== olds.fileSystemAccessRoleArn ||
                news.inTransitEncryption !== olds.inTransitEncryption;
            if (replaced)
                return { action: "replace" };
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE — output cache is the identity (EFS location URIs are
            //    not deterministically reconstructable).
            let arn = output?.locationArn;
            let loc = arn ? yield* describe(arn) : undefined;
            // 2. ENSURE — create if missing.
            if (loc === undefined) {
                const created = yield* retryWhileRoleNotAssumable(datasync.createLocationEfs({
                    EfsFilesystemArn: news.efsFilesystemArn,
                    Ec2Config: {
                        SubnetArn: news.subnetArn,
                        SecurityGroupArns: news.securityGroupArns,
                    },
                    Subdirectory: news.subdirectory,
                    AccessPointArn: news.accessPointArn,
                    FileSystemAccessRoleArn: news.fileSystemAccessRoleArn,
                    InTransitEncryption: news.inTransitEncryption,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                }));
                arn = created.LocationArn;
                loc = yield* describe(arn);
            }
            // 3. SYNC tags against observed cloud state.
            const observed = yield* readObservedTags(arn);
            yield* syncTags(arn, observed, desiredTags);
            yield* session.note(arn);
            return {
                locationArn: loc.LocationArn,
                locationUri: loc.LocationUri,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* datasync
                .deleteLocation({ LocationArn: output.locationArn })
                .pipe(Effect.catchTag("LocationNotFound", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=LocationEfs.js.map