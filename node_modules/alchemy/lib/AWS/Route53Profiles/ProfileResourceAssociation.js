import * as profiles from "@distilled.cloud/aws/route53profiles";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * An attachment of a DNS resource to a Route 53 Profile. Attach private
 * hosted zones, Resolver rules, or DNS Firewall rule groups; every VPC the
 * Profile is associated with picks up the resource.
 * ### Attaching Resources
 * **Example:** Attach a DNS Firewall Rule Group
 * ```typescript
 * import * as Route53Profiles from "alchemy/AWS/Route53Profiles";
 *
 * const attachment = yield* Route53Profiles.ProfileResourceAssociation(
 *   "FirewallRules",
 *   {
 *     profileId: profile.profileId,
 *     resourceArn: ruleGroupArn,
 *     resourceProperties: JSON.stringify({ priority: 102 }),
 *   },
 * );
 * ```
 *
 * **Example:** Attach a Resolver Rule
 * ```typescript
 * const attachment = yield* Route53Profiles.ProfileResourceAssociation(
 *   "CorpForwarding",
 *   {
 *     profileId: profile.profileId,
 *     resourceArn: rule.resolverRuleArn,
 *   },
 * );
 * ```
 *
 * @resource
 */
export const ProfileResourceAssociation = Resource("AWS.Route53Profiles.ProfileResourceAssociation");
/**
 * Associating/updating/disassociating while the Profile or the association
 * is still settling surfaces `ConflictException`; retry on a bounded
 * schedule (~60s).
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
 * Bounded wait (~2 min) for a disassociation to drain so the Profile and
 * the attached resource can be deleted right after. If it is still draining
 * after the budget we proceed — downstream deletes absorb the residual with
 * their own bounded retries.
 *
 * @internal
 */
const untilAssociationGone = (self) => self.pipe(Effect.repeat({
    schedule: Schedule.fixed("4 seconds"),
    until: (association) => association === undefined,
    times: 30,
}));
/**
 * Compare two resource-properties JSON strings structurally (key order and
 * whitespace insensitive). Invalid JSON falls back to string equality.
 *
 * @internal
 */
const sameResourceProperties = (a, b) => {
    if (a === b)
        return true;
    if (a === undefined || b === undefined)
        return false;
    try {
        return JSON.stringify(JSON.parse(a)) === JSON.stringify(JSON.parse(b));
    }
    catch {
        return false;
    }
};
export const ProfileResourceAssociationProvider = () => Provider.effect(ProfileResourceAssociation, Effect.gen(function* () {
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
    const observeById = (profileResourceAssociationId) => profiles
        .getProfileResourceAssociation({
        ProfileResourceAssociationId: profileResourceAssociationId,
    })
        .pipe(Effect.map((r) => isLive(r.ProfileResourceAssociation)), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const observeByPair = (profileId, resourceArn) => profiles.listProfileResourceAssociations
        .items({ ProfileId: profileId })
        .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
        .filter((association) => association.ResourceArn === resourceArn)
        .map(isLive)
        .find((association) => association !== undefined)), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const toAttributes = (association) => ({
        profileResourceAssociationId: association.Id,
        profileId: association.ProfileId,
        resourceArn: association.ResourceArn,
        resourceType: association.ResourceType ?? "",
        name: association.Name ?? "",
        resourceProperties: association.ResourceProperties,
        status: association.Status ?? "COMPLETE",
    });
    return ProfileResourceAssociation.Provider.of({
        stables: ["profileResourceAssociationId", "profileId", "resourceArn"],
        // Parent-keyed listing only — enumerate every Profile, then each
        // Profile's resource associations.
        list: () => profiles.listProfiles.items({}).pipe(Stream.runCollect, Effect.flatMap((chunk) => Effect.forEach(Array.from(chunk).flatMap((summary) => summary.Id !== undefined ? [summary.Id] : []), (profileId) => profiles.listProfileResourceAssociations
            .items({ ProfileId: profileId })
            .pipe(Stream.runCollect, Effect.map(Array.from), 
        // The profile can vanish between enumeration and listing.
        Effect.catchTag("ResourceNotFoundException", () => Effect.succeed([]))), { concurrency: 5 })), Effect.map((groups) => groups
            .flat()
            .filter((association) => association.Id !== undefined &&
            association.ProfileId !== undefined &&
            association.ResourceArn !== undefined &&
            association.Status !== "DELETING" &&
            association.Status !== "DELETED")
            .map(toAttributes))),
        read: Effect.fn(function* ({ olds, output }) {
            const association = output?.profileResourceAssociationId
                ? yield* observeById(output.profileResourceAssociationId)
                : olds?.profileId !== undefined && olds.resourceArn !== undefined
                    ? yield* observeByPair(olds.profileId, olds.resourceArn)
                    : undefined;
            if (association?.Id === undefined)
                return undefined;
            return toAttributes(association);
        }),
        // Identity changes replace; name and resourceProperties update in
        // place via the default update path.
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (olds.profileId !== news.profileId ||
                olds.resourceArn !== news.resourceArn) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.name ?? (yield* createName(id, news));
            // OBSERVE
            let association = output?.profileResourceAssociationId
                ? yield* observeById(output.profileResourceAssociationId)
                : undefined;
            if (!association) {
                association = yield* observeByPair(news.profileId, news.resourceArn);
            }
            // ENSURE
            if (!association) {
                association = yield* retryConflict(profiles.associateResourceToProfile({
                    ProfileId: news.profileId,
                    ResourceArn: news.resourceArn,
                    Name: name,
                    ResourceProperties: news.resourceProperties,
                })).pipe(Effect.map((r) => r.ProfileResourceAssociation));
            }
            // SYNC name + resourceProperties against OBSERVED state. Updates
            // are accepted even while the association is still settling.
            const nameDelta = association.Name !== name ? name : undefined;
            const propsDelta = news.resourceProperties !== undefined &&
                !sameResourceProperties(association.ResourceProperties, news.resourceProperties)
                ? news.resourceProperties
                : undefined;
            if (nameDelta !== undefined || propsDelta !== undefined) {
                const updated = yield* retryConflict(profiles.updateProfileResourceAssociation({
                    ProfileResourceAssociationId: association.Id,
                    Name: nameDelta,
                    ResourceProperties: propsDelta,
                }));
                association = updated.ProfileResourceAssociation ?? association;
            }
            yield* session.note(`${news.profileId}/${news.resourceArn}`);
            return toAttributes(association);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryConflict(profiles.disassociateResourceFromProfile({
                ProfileId: output.profileId,
                ResourceArn: output.resourceArn,
            })).pipe(Effect.asVoid, Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            // Disassociation drains asynchronously (~1 min). Wait (bounded) so
            // the Profile and the attached resource can be deleted right after.
            yield* untilAssociationGone(observeById(output.profileResourceAssociationId));
        }),
    });
}));
//# sourceMappingURL=ProfileResourceAssociation.js.map