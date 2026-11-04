import * as rolesanywhere from "@distilled.cloud/aws/rolesanywhere";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { toWireSeconds } from "../../Util/Duration.js";
import { readRolesAnywhereTags, syncRolesAnywhereTags, toWireTags, } from "./internal.js";
/**
 * Raised when the RolesAnywhere API acknowledges a profile write but returns
 * no profile detail and the profile cannot be found by name afterwards.
 */
export class ProfileMissing extends Data.TaggedError("ProfileMissing") {
}
/**
 * An IAM Roles Anywhere profile — the list of IAM roles that the Roles
 * Anywhere service is trusted to assume for authenticated certificate
 * identities, optionally intersected with managed policies and an inline
 * session policy.
 * ### Creating a Profile
 * **Example:** Basic Profile
 * ```typescript
 * const role = yield* IAM.Role("WorkloadRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "rolesanywhere.amazonaws.com" },
 *         Action: ["sts:AssumeRole", "sts:TagSession", "sts:SetSourceIdentity"],
 *       },
 *     ],
 *   },
 * });
 * const profile = yield* RolesAnywhere.Profile("Profile", {
 *   roleArns: [role.roleArn],
 * });
 * ```
 *
 * ### Restricting the Session
 * **Example:** Session Policy and Duration
 * ```typescript
 * const profile = yield* RolesAnywhere.Profile("Profile", {
 *   roleArns: [role.roleArn],
 *   duration: "15 minutes",
 *   sessionPolicy: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [
 *       { Effect: "Allow", Action: "s3:GetObject", Resource: "*" },
 *     ],
 *   }),
 * });
 * ```
 *
 * ### Mapping Certificate Attributes
 * **Example:** Session Tags from the Certificate Subject
 * ```typescript
 * const profile = yield* RolesAnywhere.Profile("Profile", {
 *   roleArns: [role.roleArn],
 *   attributeMappings: [
 *     {
 *       certificateField: "x509Subject",
 *       mappingRules: [{ specifier: "CN" }],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const Profile = Resource("AWS.RolesAnywhere.Profile");
const toAttrs = (detail) => ({
    profileId: detail.profileId,
    profileArn: detail.profileArn,
    profileName: detail.name,
    roleArns: [...(detail.roleArns ?? [])],
    enabled: detail.enabled ?? false,
});
const sameMembers = (left, right) => {
    const l = [...(left ?? [])].sort();
    const r = [...(right ?? [])].sort();
    return l.length === r.length && l.every((v, i) => v === r[i]);
};
export const ProfileProvider = () => Provider.effect(Profile, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.profileName ??
            (yield* createPhysicalName({ id, maxLength: 255 })));
    });
    /** Find a profile by its user-facing name across all pages. */
    const findByName = (name) => rolesanywhere.listProfiles.items({}).pipe(Stream.filter((detail) => detail.name === name), Stream.runHead, Effect.map((head) => (head._tag === "Some" ? head.value : undefined)));
    const getById = (profileId) => rolesanywhere.getProfile({ profileId }).pipe(Effect.map((r) => r.profile), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    return {
        stables: ["profileId", "profileArn"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            // requireInstanceProperties has no member on updateProfile — it is
            // immutable after create, so a change forces a replacement.
            if ((olds?.requireInstanceProperties ?? false) !==
                (news.requireInstanceProperties ?? false)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const found = output?.profileId
                ? yield* getById(output.profileId)
                : yield* findByName(yield* createName(id, olds ?? {}));
            if (found === undefined)
                return undefined;
            const attrs = toAttrs(found);
            const tags = yield* readRolesAnywhereTags(attrs.profileArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, olds, output, session }) {
            const name = output?.profileName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const desiredEnabled = news.enabled ?? true;
            const desiredDurationSeconds = toWireSeconds(news.duration);
            // 1. Observe — cloud state is authoritative; output caches the id.
            let live = output?.profileId
                ? yield* getById(output.profileId)
                : yield* findByName(name);
            // 2. Ensure — create if missing.
            if (live === undefined) {
                const created = yield* rolesanywhere.createProfile({
                    name,
                    roleArns: news.roleArns,
                    sessionPolicy: news.sessionPolicy,
                    managedPolicyArns: news.managedPolicyArns,
                    durationSeconds: desiredDurationSeconds,
                    requireInstanceProperties: news.requireInstanceProperties,
                    acceptRoleSessionName: news.acceptRoleSessionName,
                    enabled: desiredEnabled,
                    tags: toWireTags(desiredTags),
                });
                live = created.profile ?? (yield* findByName(name));
                if (live === undefined) {
                    return yield* new ProfileMissing({ name });
                }
            }
            else {
                // 3. Sync — converge the mutable aspects (name, roleArns,
                // sessionPolicy, managedPolicyArns, duration,
                // acceptRoleSessionName) by diffing observed against desired.
                const desiredName = news.profileName ?? live.name;
                const drift = live.name !== desiredName ||
                    !sameMembers(live.roleArns, news.roleArns) ||
                    !sameMembers(live.managedPolicyArns, news.managedPolicyArns) ||
                    (news.sessionPolicy !== undefined &&
                        live.sessionPolicy !== news.sessionPolicy) ||
                    (desiredDurationSeconds !== undefined &&
                        live.durationSeconds !== desiredDurationSeconds) ||
                    (news.acceptRoleSessionName !== undefined &&
                        (live.acceptRoleSessionName ?? false) !==
                            news.acceptRoleSessionName);
                if (drift) {
                    const updated = yield* rolesanywhere.updateProfile({
                        profileId: live.profileId,
                        name: desiredName,
                        roleArns: news.roleArns,
                        sessionPolicy: news.sessionPolicy,
                        managedPolicyArns: news.managedPolicyArns,
                        durationSeconds: desiredDurationSeconds,
                        acceptRoleSessionName: news.acceptRoleSessionName,
                    });
                    live = updated.profile ?? live;
                }
            }
            // Explicitly annotated so control-flow analysis inside the sync
            // loops below (which reassign from API responses that themselves
            // take `profile.profileId` as input) never cycles back into an
            // inferred `ProfileDetail | undefined`.
            let profile = live;
            // 3a. Sync attribute mappings — diff the OBSERVED mappings against
            // the desired set. A fresh profile carries AWS default mappings
            // that must not be touched unless the user manages that field, so
            // deletions are driven by the fields previously declared in `olds`
            // rather than full replacement of observed state.
            const desiredMappings = news.attributeMappings ?? [];
            const observedMappings = new Map((profile.attributeMappings ?? []).map((m) => [
                m.certificateField,
                (m.mappingRules ?? []).map((r) => r.specifier),
            ]));
            for (const mapping of desiredMappings) {
                const observedSpecifiers = observedMappings.get(mapping.certificateField);
                const desiredSpecifiers = mapping.mappingRules.map((r) => r.specifier);
                if (observedSpecifiers === undefined ||
                    !sameMembers(observedSpecifiers, desiredSpecifiers)) {
                    const mapped = yield* rolesanywhere.putAttributeMapping({
                        profileId: profile.profileId,
                        certificateField: mapping.certificateField,
                        mappingRules: mapping.mappingRules.map((r) => ({
                            specifier: r.specifier,
                        })),
                    });
                    profile = mapped.profile;
                }
            }
            const desiredFields = new Set(desiredMappings.map((m) => m.certificateField));
            for (const previous of olds?.attributeMappings ?? []) {
                if (!desiredFields.has(previous.certificateField) &&
                    observedMappings.has(previous.certificateField)) {
                    const cleaned = yield* rolesanywhere
                        .deleteAttributeMapping({
                        profileId: profile.profileId,
                        certificateField: previous.certificateField,
                    })
                        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
                    profile = cleaned?.profile ?? profile;
                }
            }
            if ((profile.enabled ?? false) !== desiredEnabled) {
                // The enable/disable response can echo the pre-toggle state — the
                // successful call itself is authoritative for the flag.
                yield* desiredEnabled
                    ? rolesanywhere.enableProfile({ profileId: profile.profileId })
                    : rolesanywhere.disableProfile({ profileId: profile.profileId });
                profile = { ...profile, enabled: desiredEnabled };
            }
            // 3b. Sync tags against observed cloud tags.
            yield* syncRolesAnywhereTags(profile.profileArn, desiredTags);
            yield* session.note(profile.profileId);
            return toAttrs(profile);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* rolesanywhere
                .deleteProfile({ profileId: output.profileId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
        list: () => rolesanywhere.listProfiles.items({}).pipe(Stream.map(toAttrs), Stream.runCollect, Effect.map((chunk) => Array.from(chunk))),
    };
}));
//# sourceMappingURL=Profile.js.map