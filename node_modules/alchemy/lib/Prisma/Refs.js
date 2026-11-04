import * as Effect from "effect/Effect";
import * as Output from "../Output.js";
export const isInputObject = (value) => typeof value === "object" &&
    value !== null &&
    !Output.isOutput(value) &&
    !Effect.isEffect(value);
export const isPrismaDevId = (value) => typeof value === "string" && value.startsWith("dev:");
export const concreteIdOf = (value) => typeof value === "string" && !isPrismaDevId(value) ? value : undefined;
export const concreteIdsChanged = (oldId, newId) => oldId !== undefined && newId !== undefined && newId !== oldId;
const resolveId = (label, value) => Effect.gen(function* () {
    if (typeof value === "string")
        return value;
    if (Output.isOutput(value)) {
        const accessor = yield* value;
        return yield* accessor;
    }
    return yield* Effect.fail(new Error(`Unable to resolve Prisma ${label}.`));
});
export const unresolvedProjectIdOf = (project) => concreteIdOf(typeof project === "string" ? project : project?.projectId);
export const resolveProjectId = (project) => resolveId("project id", typeof project === "string" ? project : project.projectId);
export const unresolvedDatabaseIdOf = (database) => concreteIdOf(typeof database === "string" ? database : database?.databaseId);
export const resolveDatabaseId = (database) => resolveId("database id", typeof database === "string" ? database : database.databaseId);
export const unresolvedBucketIdOf = (bucket) => concreteIdOf(typeof bucket === "string" ? bucket : bucket?.bucketId);
export const resolveBucketId = (bucket) => resolveId("bucket id", typeof bucket === "string" ? bucket : bucket.bucketId);
export const unresolvedAppIdOf = (app) => concreteIdOf(typeof app === "string" ? app : app?.appId);
export const resolveAppId = (app) => resolveId("app id", typeof app === "string" ? app : app.appId);
//# sourceMappingURL=Refs.js.map