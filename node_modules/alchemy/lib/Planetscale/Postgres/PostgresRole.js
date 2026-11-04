import { Credentials } from "@distilled.cloud/planetscale/Credentials";
import * as planetscale from "@distilled.cloud/planetscale";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { isKnownError, PlanetscaleConflict, waitForBranchReady, } from "../Util.js";
/** @resource */
export const PostgresRole = Resource("Planetscale.PostgresRole");
export const PostgresRoleProvider = () => Provider.succeed(PostgresRole, {
    stables: ["id"],
    diff: Effect.fn(function* ({ id, news, olds, output }) {
        if (!isResolved(news))
            return undefined;
        // Successor is the only updatable property — everything else
        // requires replacement.
        if (news.ttl !== olds.ttl) {
            return { action: "replace" };
        }
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
        const newRoles = [...resolveInheritedRoles(news.inheritedRoles)].sort();
        const oldRoles = [...(output?.inheritedRoles ?? [])].sort();
        if (!deepEqual(newRoles, oldRoles)) {
            return { action: "replace" };
        }
        const oldName = output?.name ?? (yield* resolveName(id, olds?.name));
        const newName = yield* resolveName(id, news.name);
        if (newName !== oldName) {
            return { action: "update" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output }) {
        if (!output?.id)
            return undefined;
        return yield* planetscale
            .getRole({
            branch: output.branch,
            database: output.database,
            organization: output.organization,
            id: output.id,
        })
            .pipe(Effect.map((token) => buildAttributes(token, output.password, {
            inheritedRoles: token.inherited_roles,
            successor: output.successor,
            organization: output.organization,
            database: output.database,
            branch: token.branch.name,
        })), Effect.catchTag("Forbidden", () => Effect.succeed(undefined)), Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { organization: envOrg } = yield* yield* Credentials;
        const organization = resolveDatabaseOrg(news.database) ?? envOrg;
        const databaseName = resolveDatabaseName(news.database);
        const branchName = resolveBranchName(news.branch);
        const inheritedRoles = resolveInheritedRoles(news.inheritedRoles);
        const successor = resolveSuccessorName(news.successor);
        const desiredName = yield* resolveName(id, news.name);
        // 1. Observe — fetch live state if we know the role id. Roles
        //    can only be looked up by id; without a cached id there is
        //    no way to find the live role, so we fall through to ensure.
        const observed = output?.id
            ? yield* planetscale
                .getRole({
                id: output.id,
                branch: branchName,
                organization,
                database: databaseName,
            })
                .pipe(Effect.catchTag("NotFound", () => Effect.succeed(undefined)))
            : undefined;
        // 2. Ensure — create if missing. Single branch covers both
        //    greenfield (no output) and out-of-band-deletion (output
        //    cached but cloud lost it). The latter is structurally a
        //    rotation: the new role has fresh id/host/username/plaintext
        //    that propagate downstream through the dependency graph.
        //    There is no path to recover the original plaintext, so
        //    recreating is the only way to converge.
        //
        //    Planetscale returns the plaintext password value exactly
        //    once on create; on an observe-hit we re-use the cached
        //    plaintext from output (which is why adoption requires
        //    pre-existing state — see `read`).
        let live;
        let plaintext;
        if (observed) {
            live = observed;
            plaintext = output.password;
        }
        else {
            const branchInfo = yield* planetscale.getBranch({
                organization,
                database: databaseName,
                branch: branchName,
            });
            if (branchInfo.kind !== "postgresql") {
                return yield* Effect.fail(new PlanetscaleConflict({
                    message: `Cannot create a Role on MySQL database "${databaseName}". Roles are only supported on PostgreSQL. Use Password for MySQL.`,
                }));
            }
            if (!branchInfo.ready) {
                yield* waitForBranchReady(organization, databaseName, branchName);
            }
            const created = yield* planetscale.createRole({
                name: desiredName,
                branch: branchName,
                organization,
                database: databaseName,
                ttl: news.ttl,
                inherited_roles: inheritedRoles,
            });
            if (!created.password) {
                return yield* Effect.die(`Planetscale did not return a password for Role "${desiredName}".`);
            }
            plaintext = created.password;
            live = created;
        }
        // 3. Sync — only `name` is mutable in place; diff observed
        //    against desired and skip the API call when nothing
        //    changed. Everything else triggers a replace via diff().
        if (live.name !== desiredName) {
            live = yield* planetscale.updateRole({
                id: live.id,
                branch: branchName,
                organization,
                database: databaseName,
                name: desiredName,
            });
        }
        // 4. Return — fresh attrs sourced from observed cloud state,
        //    with cached or freshly-issued plaintext.
        return buildAttributes(live, plaintext, {
            inheritedRoles: live.inherited_roles,
            successor,
            organization,
            database: databaseName,
            branch: branchName,
        });
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* planetscale
            .deleteRole({
            organization: output.organization,
            database: output.database,
            branch: output.branch,
            id: output.id,
            successor: output.successor,
        })
            .pipe(Effect.catchTag("NotFound", () => Effect.void), 
        // 422 (UnprocessableEntity): role is still referenced. Log a
        // warning rather than failing — the role will be cleaned up
        // when the database/branch is deleted.
        Effect.catchIf(isKnownError("UnprocessableEntity", "Role is still referenced and cannot be dropped."), () => Effect.void));
    }),
    list: Effect.fn(function* () {
        const { organization } = yield* yield* Credentials;
        const databases = yield* planetscale.listDatabases
            .pages({ organization })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.data.filter((db) => db.kind === "postgresql"))));
        const rows = yield* Effect.forEach(databases, (db) => planetscale.listBranches
            .pages({ organization, database: db.name })
            .pipe(Stream.runCollect, Effect.map((branchPages) => Array.from(branchPages).flatMap((page) => page.data.filter((branch) => branch.kind === "postgresql"))), Effect.catchTag("NotFound", () => Effect.succeed([{ name: db.default_branch ?? "main" }])), Effect.flatMap((branches) => Effect.forEach(branches, (branch) => planetscale.listRoles
            .pages({
            organization,
            database: db.name,
            branch: branch.name,
        })
            .pipe(Stream.runCollect, Effect.map((rolePages) => Array.from(rolePages).flatMap((page) => page.data
            .filter((role) => !role.default)
            .map((role) => buildAttributes(role, Redacted.make(""), {
            inheritedRoles: role.inherited_roles,
            successor: "postgres",
            organization,
            database: db.name,
            branch: branch.name,
        })))), Effect.catchTag("NotFound", () => Effect.succeed([])), Effect.catchTag("Forbidden", () => Effect.succeed([]))), { concurrency: 10 }).pipe(Effect.map((perBranch) => perBranch.flat())))), { concurrency: 10 });
        return rows.flat();
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
const resolveSuccessorName = (successor) => {
    const ref = successor;
    return !ref ? "postgres" : typeof ref === "string" ? ref : ref.name;
};
const resolveInheritedRoles = (inheritedRoles) => {
    if (Array.isArray(inheritedRoles)) {
        return inheritedRoles;
    }
    // At runtime, a Role passed in is its resolved attributes (with
    // `inheritedRoles` as a plain array); statically `Role.inheritedRoles`
    // is `Output<InheritedRole[]>`.
    return inheritedRoles.inheritedRoles;
};
const resolveName = (id, name) => Effect.gen(function* () {
    return (name ??
        (yield* createPhysicalName({ id, lowercase: true, maxLength: 63 })));
});
const buildAttributes = (role, password, context) => {
    const passwordValue = Redacted.value(password);
    const connectionUrl = `postgresql://${role.username}:${passwordValue}@${role.access_host_url}:5432/${role.database_name}?sslmode=verify-full`;
    const connectionUrlPooled = `postgresql://${role.username}:${passwordValue}@${role.access_host_url}:6432/${role.database_name}?sslmode=verify-full`;
    return {
        id: role.id,
        name: role.name,
        expiresAt: role.expires_at,
        host: role.access_host_url,
        username: role.username,
        password,
        connectionUrl: Redacted.make(connectionUrl),
        connectionUrlPooled: Redacted.make(connectionUrlPooled),
        privateHost: role.private_access_host_url,
        privateConnectionServiceName: role.private_connection_service_name,
        inheritedRoles: context.inheritedRoles,
        successor: context.successor,
        organization: context.organization,
        database: context.database,
        databaseName: role.database_name,
        origin: {
            scheme: "postgres",
            host: role.access_host_url,
            port: 5432,
            database: role.database_name,
            user: role.username,
            password,
        },
        pooledOrigin: {
            scheme: "postgres",
            host: role.access_host_url,
            port: 6432,
            database: role.database_name,
            user: role.username,
            password,
        },
        branch: context.branch,
        ttl: role.ttl,
    };
};
//# sourceMappingURL=PostgresRole.js.map