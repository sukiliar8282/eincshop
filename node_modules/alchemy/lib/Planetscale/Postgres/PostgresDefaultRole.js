import { Credentials } from "@distilled.cloud/planetscale/Credentials";
import * as planetscale from "@distilled.cloud/planetscale";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { PlanetscaleConflict, waitForBranchReady } from "../Util.js";
/** @resource */
export const PostgresDefaultRole = Resource("Planetscale.PostgresDefaultRole");
export const PostgresDefaultRoleProvider = () => Provider.succeed(PostgresDefaultRole, {
    stables: ["id"],
    diff: Effect.fn(function* ({ news, olds = {} }) {
        if (!isResolved(news))
            return undefined;
        const newDb = resolveDatabaseName(news.database);
        const oldDb = olds.database
            ? resolveDatabaseName(olds.database)
            : undefined;
        if (oldDb && newDb !== oldDb) {
            return { action: "replace" };
        }
        const newBranch = resolveBranchName(news.branch);
        const oldBranch = resolveBranchName(olds.branch);
        if (newBranch !== oldBranch) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output }) {
        // Adoption (no cached output) is impossible without destroying
        // existing credentials. The engine routes adoption through
        // `read`, but here we always defer to reconcile so the
        // `forceReset` props flag remains the user-facing switch for
        // takeover. Returning undefined makes the engine treat the
        // resource as greenfield; reconcile then observes live state
        // and either fails (no forceReset) or resets (forceReset).
        if (!output)
            return undefined;
        // Refresh — verify the default role still exists and re-emit
        // the persisted output (with plaintext intact). If gone,
        // return undefined so the engine routes through reconcile,
        // which will recreate via reset.
        return yield* planetscale
            .getDefaultRole({
            organization: output.organization,
            database: output.database,
            branch: output.branch,
        })
            .pipe(Effect.map((role) => ({
            ...output,
            privateHost: role.private_access_host_url,
            privateConnectionServiceName: role.private_connection_service_name,
        })), Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { organization: envOrg } = yield* yield* Credentials;
        const organization = resolveDatabaseOrg(news.database) ?? envOrg;
        const databaseName = resolveDatabaseName(news.database);
        const branchName = resolveBranchName(news.branch);
        // 1. Observe — the default role is the singleton for this
        //    (database, branch); we key on those rather than an id.
        //    Observation runs unconditionally so the adoption guard
        //    below fires on greenfield deploys against branches that
        //    already have a default role (otherwise we would silently
        //    `resetDefault` and destroy their credentials).
        const observed = yield* planetscale
            .getDefaultRole({
            organization,
            database: databaseName,
            branch: branchName,
        })
            .pipe(Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
        // 2. Sync (no-op) — we own the role and it still exists in the
        //    cloud. Default roles have nothing mutable in place: their
        //    plaintext password isn't retrievable, so we retain the cached
        //    credentials while refreshing the private connection details.
        //    diff() forces a replace when database/branch change.
        if (output && observed) {
            return {
                ...output,
                privateHost: observed.private_access_host_url,
                privateConnectionServiceName: observed.private_connection_service_name,
            };
        }
        // 3. Adoption guard — observed exists but we have no prior
        //    output (greenfield against a pre-existing default role).
        //    Taking over requires a reset (which destroys the existing
        //    password), so gate on an explicit forceReset opt-in.
        if (observed && !news.forceReset) {
            return yield* Effect.fail(new PlanetscaleConflict({
                message: `Default role already exists for database "${databaseName}" branch "${branchName}". Use forceReset: true to reset.`,
            }));
        }
        // 4. Ensure — (re)create the default role. This branch runs
        //    for greenfield (no output, no observed), drift recovery
        //    (output cached but cloud state gone), and authorised
        //    adoption (observed present + forceReset).
        yield* waitForBranchReady(organization, databaseName, branchName);
        const data = yield* planetscale.resetDefaultRole({
            organization,
            database: databaseName,
            branch: branchName,
        });
        if (!data.password) {
            return yield* Effect.die(`Planetscale did not return a password for Default Role.`);
        }
        const password = Redacted.isRedacted(data.password)
            ? Redacted.value(data.password)
            : data.password;
        const connectionUrl = `postgresql://${data.username}:${password}@${data.access_host_url}:5432/${data.database_name}?sslmode=verify-full`;
        const connectionUrlPooled = `postgresql://${data.username}:${password}@${data.access_host_url}:6432/${data.database_name}?sslmode=verify-full`;
        return {
            id: data.id,
            name: data.name,
            expiresAt: data.expires_at,
            host: data.access_host_url,
            username: data.username,
            password: Redacted.make(password),
            ttl: data.ttl,
            databaseName: data.database_name,
            connectionUrl: Redacted.make(connectionUrl),
            connectionUrlPooled: Redacted.make(connectionUrlPooled),
            privateHost: data.private_access_host_url,
            privateConnectionServiceName: data.private_connection_service_name,
            inheritedRoles: data.inherited_roles,
            organization,
            database: databaseName,
            branch: branchName,
        };
    }),
    delete: Effect.fn(function* ({ output }) {
        // No delete endpoint — reset to invalidate existing credentials.
        yield* planetscale
            .resetDefaultRole({
            organization: output.organization,
            database: output.database,
            branch: output.branch,
        })
            .pipe(Effect.catchTag("NotFound", () => Effect.void));
    }),
    list: Effect.fn(function* () {
        const { organization } = yield* yield* Credentials;
        const roles = yield* planetscale.listDatabases
            .pages({ organization })
            .pipe(Stream.map((page) => page.data.filter((db) => db.kind === "postgresql")), Stream.flattenIterable, Stream.flatMap((db) => planetscale.listBranches
            .pages({ organization, database: db.name })
            .pipe(Stream.map((page) => page.data.filter((branch) => branch.kind === "postgresql")), Stream.flattenIterable, Stream.catchTag("NotFound", () => Stream.succeed({ name: db.default_branch ?? "main" })), Stream.flatMap((branch) => planetscale.listRoles
            .pages({
            organization,
            database: db.name,
            branch: branch.name,
        })
            .pipe(Stream.map((page) => page.data
            .filter((role) => role.default)
            .map((role) => ({
            id: role.id,
            name: role.name,
            expiresAt: role.expires_at,
            host: role.access_host_url,
            username: role.username,
            password: Redacted.make(""),
            ttl: role.ttl,
            databaseName: role.database_name,
            connectionUrl: Redacted.make(""),
            connectionUrlPooled: Redacted.make(""),
            privateHost: role.private_access_host_url,
            privateConnectionServiceName: role.private_connection_service_name,
            inheritedRoles: role.inherited_roles,
            organization,
            database: db.name,
            branch: branch.name,
        }))), Stream.flattenIterable, Stream.catchTags({
            NotFound: () => Stream.empty,
            Forbidden: () => Stream.empty,
        })), { concurrency: 10 })), { concurrency: 10 }), Stream.runCollect);
        return Array.from(roles);
    }),
});
const resolveDatabaseName = (database) => {
    const ref = database;
    return typeof ref === "string" ? ref : ref.name;
};
const resolveDatabaseOrg = (database) => {
    const ref = database;
    return typeof ref === "string" ? undefined : ref.organization;
};
const resolveBranchName = (branch) => {
    const ref = branch;
    return !ref ? "main" : typeof ref === "string" ? ref : ref.name;
};
//# sourceMappingURL=PostgresDefaultRole.js.map