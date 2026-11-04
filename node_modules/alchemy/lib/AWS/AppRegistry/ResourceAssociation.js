import * as appregistry from "@distilled.cloud/aws/service-catalog-appregistry";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * Raised when a freshly created resource association has not become visible
 * to `getAssociatedResource` within the bounded eventual-consistency window.
 */
export class ResourceAssociationNotVisible extends Data.TaggedError("ResourceAssociationNotVisible") {
}
/**
 * Associates an AWS resource (a CloudFormation stack or a tag-value query)
 * with an AppRegistry {@link Application} so the resource is inventoried
 * under the application in myApplications.
 *
 * ### Associating a Resource
 * **Example:** Associate a CloudFormation Stack
 * ```typescript
 * import * as AppRegistry from "alchemy/AWS/AppRegistry";
 * import * as CloudFormation from "alchemy/AWS/CloudFormation";
 *
 * const app = yield* AppRegistry.Application("Storefront", {});
 * const stack = yield* CloudFormation.Stack("Network", {
 *   templateBody: networkTemplateJson,
 * });
 *
 * const association = yield* AppRegistry.ResourceAssociation("StackAssoc", {
 *   application: app.applicationId,
 *   resourceType: "CFN_STACK",
 *   resource: stack.stackName,
 * });
 * ```
 *
 * **Example:** Associate Without Applying the Application Tag
 * ```typescript
 * const association = yield* AppRegistry.ResourceAssociation("StackAssoc", {
 *   application: app.applicationId,
 *   resourceType: "CFN_STACK",
 *   resource: stack.stackName,
 *   options: ["SKIP_APPLICATION_TAG"],
 * });
 * ```
 *
 * @resource
 */
export const ResourceAssociation = Resource("AWS.AppRegistry.ResourceAssociation");
const sameOptions = (observed, desired) => {
    const observedSet = new Set(observed ?? []);
    return (desired.length === observedSet.size &&
        desired.every((option) => observedSet.has(option)));
};
export const ResourceAssociationProvider = () => Provider.effect(ResourceAssociation, Effect.gen(function* () {
    const observeApplication = Effect.fn(function* (specifier) {
        return yield* appregistry
            .getApplication({ application: specifier })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const observeAssociation = Effect.fn(function* (application, resourceType, resource) {
        return yield* appregistry
            .getAssociatedResource({ application, resourceType, resource })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return ResourceAssociation.Provider.of({
        stables: [
            "applicationId",
            "applicationArn",
            "resourceType",
            "resourceName",
            "resourceArn",
        ],
        // The application/resource pair IS the association's identity —
        // changing either side replaces it. `options` is synced in place.
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            if (olds !== undefined &&
                (olds.application !== news.application ||
                    olds.resourceType !== news.resourceType ||
                    olds.resource !== news.resource)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const applicationSpecifier = output?.applicationId ?? olds?.application;
            const resourceType = output?.resourceType ?? olds?.resourceType;
            const resource = output?.resourceName ?? olds?.resource;
            if (applicationSpecifier === undefined ||
                resourceType === undefined ||
                resource === undefined) {
                return undefined;
            }
            const application = yield* observeApplication(applicationSpecifier);
            if (application?.id === undefined)
                return undefined;
            const association = yield* observeAssociation(application.id, resourceType, resource);
            if (association?.resource?.arn === undefined)
                return undefined;
            // Associations cannot carry tags; existence under our application
            // is the ownership signal.
            return {
                applicationId: application.id,
                applicationArn: application.arn,
                resourceType,
                resourceName: association.resource.name ?? resource,
                resourceArn: association.resource.arn,
            };
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            // 1. OBSERVE — resolve the application; a missing parent surfaces
            // its typed ResourceNotFoundException.
            const application = yield* appregistry.getApplication({
                application: news.application,
            });
            const applicationId = application.id;
            const associate = appregistry
                .associateResource({
                application: applicationId,
                resourceType: news.resourceType,
                resource: news.resource,
                options: news.options,
            })
                .pipe(Effect.catchTag("ConflictException", () => Effect.void));
            let observed = yield* observeAssociation(applicationId, news.resourceType, news.resource);
            // 2. ENSURE — associate when missing; tolerate a concurrent
            // associate race (ConflictException).
            if (observed?.resource === undefined) {
                yield* associate;
            }
            else if (news.options !== undefined &&
                !sameOptions(observed.options, news.options)) {
                // 3. SYNC options — the API has no update; converge by
                // re-creating the association in place.
                yield* appregistry
                    .disassociateResource({
                    application: applicationId,
                    resourceType: news.resourceType,
                    resource: news.resource,
                })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
                yield* associate;
            }
            // 4. RETURN — re-read with a bounded wait for the association to
            // become visible.
            observed = yield* observeAssociation(applicationId, news.resourceType, news.resource).pipe(Effect.flatMap((association) => association?.resource?.arn !== undefined
                ? Effect.succeed(association)
                : Effect.fail(new ResourceAssociationNotVisible({
                    application: applicationId,
                    resource: news.resource,
                }))), Effect.retry({
                while: (e) => e._tag === "ResourceAssociationNotVisible",
                schedule: Schedule.max([
                    Schedule.fixed("2 seconds"),
                    Schedule.recurs(8),
                ]),
            }));
            yield* session.note(`${applicationId}/${news.resource}`);
            return {
                applicationId,
                applicationArn: application.arn,
                resourceType: news.resourceType,
                resourceName: observed.resource.name ?? news.resource,
                resourceArn: observed.resource.arn,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* appregistry
                .disassociateResource({
                application: output.applicationId,
                resourceType: output.resourceType,
                resource: output.resourceName,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
        list: () => Effect.gen(function* () {
            const applications = yield* appregistry.listApplications
                .pages({})
                .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.applications ?? [])));
            const results = [];
            for (const application of applications) {
                if (application.id === undefined)
                    continue;
                const resources = yield* appregistry.listAssociatedResources
                    .pages({ application: application.id })
                    .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.resources ?? [])));
                for (const resource of resources) {
                    if (resource.arn === undefined || resource.name === undefined) {
                        continue;
                    }
                    results.push({
                        applicationId: application.id,
                        applicationArn: application.arn,
                        resourceType: resource.resourceType ?? "CFN_STACK",
                        resourceName: resource.name,
                        resourceArn: resource.arn,
                    });
                }
            }
            return results;
        }),
    });
}));
//# sourceMappingURL=ResourceAssociation.js.map