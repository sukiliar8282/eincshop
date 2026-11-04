import * as profiles from "@distilled.cloud/aws/route53profiles";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags } from "../../Tags.js";
/**
 * An association between a Route 53 Profile and a VPC. Once the association
 * completes, every DNS resource attached to the Profile (private hosted
 * zones, Resolver rules, DNS Firewall rule groups) takes effect in the VPC.
 *
 * A VPC can have only one Profile associated with it; a Profile can be
 * associated with thousands of VPCs. The association is created immediately
 * but completes asynchronously — the returned `status` is typically still
 * `CREATING` when the deploy finishes.
 * ### Associating a Profile
 * **Example:** Apply a Profile to a VPC
 * ```typescript
 * import * as Route53Profiles from "alchemy/AWS/Route53Profiles";
 *
 * const association = yield* Route53Profiles.ProfileAssociation("AppVpcDns", {
 *   profileId: profile.profileId,
 *   resourceId: vpc.vpcId,
 * });
 * ```
 *
 * @resource
 */
export const ProfileAssociation = Resource("AWS.Route53Profiles.ProfileAssociation");
/**
 * Associating/disassociating while the Profile or a prior association is
 * still settling surfaces `ConflictException`; retry on a bounded schedule
 * (~60s).
 *
 * Explicitly typed: inlining `Effect.retry` in provider lifecycle code can
 * widen the provider layer to `unknown` in declaration emit.
 *
 * @internal
 */
const retryConflict = (self) => Effect.retry(self, {
    while: (e) => e._tag === "ConflictException",
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(20)]),
});
/**
 * Bounded wait (~2 min) for a disassociation to drain. Disassociation was
 * observed to take ~1–2 minutes; waiting here keeps teardown ordering sound
 * (the Profile and the VPC both reject deletion while the association
 * exists). If the association is still draining after the budget we proceed
 * — the Profile and VPC providers absorb the residual with their own
 * bounded conflict/dependency retries.
 *
 * @internal
 */
const untilAssociationGone = (self) => self.pipe(Effect.repeat({
    schedule: Schedule.fixed("4 seconds"),
    until: (association) => association === undefined,
    times: 30,
}));
export const ProfileAssociationProvider = () => Provider.effect(ProfileAssociation, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createPhysicalName({ id, maxLength: 64 }));
    });
    // `DELETING`/`DELETED` associations count as missing so reconcile
    // re-associates and delete converges.
    const isLive = (association) => association !== undefined &&
        association.Status !== "DELETING" &&
        association.Status !== "DELETED"
        ? association
        : undefined;
    const observeById = (profileAssociationId) => profiles
        .getProfileAssociation({
        ProfileAssociationId: profileAssociationId,
    })
        .pipe(Effect.map((r) => isLive(r.ProfileAssociation)), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const observeByPair = (profileId, resourceId) => profiles.listProfileAssociations
        .items({ ProfileId: profileId, ResourceId: resourceId })
        .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
        .map(isLive)
        .find((association) => association !== undefined)));
    return ProfileAssociation.Provider.of({
        stables: ["profileAssociationId", "profileId", "resourceId", "name"],
        // Top-level enumeration: associations are listable account-wide.
        list: () => profiles.listProfileAssociations.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((association) => association.Id !== undefined &&
            association.ProfileId !== undefined &&
            association.ResourceId !== undefined &&
            association.Status !== "DELETING" &&
            association.Status !== "DELETED"
            ? [
                {
                    profileAssociationId: association.Id,
                    profileId: association.ProfileId,
                    resourceId: association.ResourceId,
                    name: association.Name ?? "",
                    status: association.Status ?? "COMPLETE",
                },
            ]
            : []))),
        read: Effect.fn(function* ({ olds, output }) {
            const association = output?.profileAssociationId
                ? yield* observeById(output.profileAssociationId)
                : olds?.profileId !== undefined && olds.resourceId !== undefined
                    ? yield* observeByPair(olds.profileId, olds.resourceId)
                    : undefined;
            if (association?.Id === undefined)
                return undefined;
            return {
                profileAssociationId: association.Id,
                profileId: association.ProfileId,
                resourceId: association.ResourceId,
                name: association.Name ?? "",
                status: association.Status ?? "COMPLETE",
            };
        }),
        // Existence-only resource — every identifying property change
        // replaces the association (there is no update API).
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (olds.profileId !== news.profileId ||
                olds.resourceId !== news.resourceId ||
                oldName !== newName) {
                return { action: "replace" };
            }
        }),
        // Existence-only: observe → if missing, associate. There is no sync
        // step. We deliberately do NOT wait for `COMPLETE` — the association
        // takes a couple of minutes to propagate and is usable as a
        // reference immediately.
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.name ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            let association = output?.profileAssociationId
                ? yield* observeById(output.profileAssociationId)
                : undefined;
            if (!association) {
                association = yield* observeByPair(news.profileId, news.resourceId);
            }
            if (!association) {
                association = yield* retryConflict(profiles.associateProfile({
                    ProfileId: news.profileId,
                    ResourceId: news.resourceId,
                    Name: name,
                    Tags: Object.entries(internalTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                })).pipe(Effect.map((r) => r.ProfileAssociation), 
                // A concurrent reconcile won the race — re-observe.
                Effect.catchTag("ResourceExistsException", () => observeByPair(news.profileId, news.resourceId).pipe(Effect.map((existing) => existing))));
            }
            yield* session.note(`${news.profileId}/${news.resourceId}`);
            return {
                profileAssociationId: association.Id,
                profileId: news.profileId,
                resourceId: news.resourceId,
                name: association.Name ?? name,
                status: association.Status ?? "CREATING",
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryConflict(profiles.disassociateProfile({
                ProfileId: output.profileId,
                ResourceId: output.resourceId,
            })).pipe(Effect.asVoid, Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            // Disassociation drains asynchronously (~1–2 min). Wait (bounded)
            // so the Profile and VPC can be deleted right after.
            yield* untilAssociationGone(observeById(output.profileAssociationId));
        }),
    });
}));
//# sourceMappingURL=ProfileAssociation.js.map