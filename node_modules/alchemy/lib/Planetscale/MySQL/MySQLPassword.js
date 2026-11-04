import { Credentials } from "@distilled.cloud/planetscale/Credentials";
import * as planetscale from "@distilled.cloud/planetscale";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/** @resource */
export const MySQLPassword = Resource("Planetscale.MySQLPassword");
export const MySQLPasswordProvider = () => Provider.succeed(MySQLPassword, {
    stables: ["id"],
    diff: Effect.fn(function* ({ olds = {}, news }) {
        if (!isResolved(news))
            return undefined;
        // Replace on any immutable-in-place change; engine falls through
        // to reconcile for everything else (which authoritatively diffs
        // against observed cloud state).
        if (news.role !== olds.role)
            return { action: "replace" };
        if (news.replica !== olds.replica) {
            return { action: "replace" };
        }
        if (news.ttl !== olds.ttl)
            return { action: "replace" };
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
        // Adoption (no cached output) is impossible: the PlanetScale API
        // never re-issues plaintext, so even if we found a matching live
        // password by listing+name we couldn't deliver the `password`
        // attribute. Fall through to greenfield create in `reconcile`.
        if (!output)
            return undefined;
        // Refresh — verify the cached password still exists and
        // re-emit the persisted output (with plaintext intact).
        // If it's gone, return undefined so the engine routes to
        // reconcile, which will surface the unrecoverable-rotation
        // condition explicitly.
        return yield* planetscale
            .getPassword({
            organization: output.organization,
            database: output.database,
            branch: output.branch,
            id: output.id,
        })
            .pipe(Effect.map((password) => buildAttributes(password, output.password, {
            organization: output.organization,
            database: output.database,
            branch: output.branch,
        })), Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const newName = yield* createPasswordName(id, news.name);
        // Identifiers — stable across update (diff replaces on
        // database/branch changes), so we can pull from `output` first
        // and fall back to `news` for greenfield.
        const { organization: envOrg } = yield* yield* Credentials;
        const organization = output?.organization ?? resolveDatabaseOrg(news.database) ?? envOrg;
        const databaseName = output?.database ?? resolveDatabaseName(news.database);
        const branchName = output?.branch ?? resolveBranchName(news.branch);
        // 1. Observe — read live state. The PlanetScale API has no
        //    "lookup by name" path (names aren't unique within a branch)
        //    so the only way to find the live password is by id. Without
        //    a cached output we cannot observe and fall straight through
        //    to ensure (greenfield create).
        const observed = output
            ? yield* planetscale
                .getPassword({
                organization,
                database: databaseName,
                branch: branchName,
                id: output.id,
            })
                .pipe(Effect.catchTag("NotFound", () => Effect.succeed(undefined)))
            : undefined;
        // 2. Ensure — create the password if it doesn't exist live.
        //    This single branch covers greenfield (no output) AND the
        //    out-of-band-deletion case (output cached but cloud lost it).
        //    The latter is structurally a rotation: the new password
        //    has a fresh id/host/username/plaintext that propagate
        //    downstream through the dependency graph. There is no path
        //    to recover the original plaintext, so recreating is the
        //    only way to converge.
        let live;
        let plaintext;
        if (observed) {
            live = observed;
            // We re-use the cached plaintext: the API never re-issues it.
            plaintext = output.password;
        }
        else {
            const created = yield* planetscale.createPassword({
                organization,
                database: databaseName,
                branch: branchName,
                name: newName,
                role: news.role,
                replica: news.replica,
                ttl: news.ttl,
                cidrs: news.cidrs,
            });
            plaintext = created.plain_text;
            live = created;
        }
        // 3. Sync — diff observed cloud state against desired and patch
        //    only what changed. Only `name` and `cidrs` are mutable in
        //    place; everything else triggers a replace via diff().
        //    Skip the API entirely when there's no delta.
        const wantsRename = newName !== live.name;
        const observedCidrs = normalizeCidrs(live.cidrs);
        const desiredCidrs = normalizeCidrs(news.cidrs);
        const wantsCidrs = !deepEqual(desiredCidrs, observedCidrs);
        if (wantsRename || wantsCidrs) {
            live = yield* planetscale.updatePassword({
                organization,
                database: databaseName,
                branch: branchName,
                id: live.id,
                name: wantsRename ? newName : undefined,
                cidrs: wantsCidrs ? news.cidrs : undefined,
            });
        }
        // 4. Return — fresh attrs sourced from observed cloud state,
        //    re-using cached plaintext when we didn't just create.
        return buildAttributes(live, plaintext, {
            organization,
            database: databaseName,
            branch: branchName,
        });
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* planetscale
            .deletePassword({
            organization: output.organization,
            database: output.database,
            branch: output.branch,
            id: output.id,
        })
            .pipe(Effect.catchTag("NotFound", () => Effect.void));
    }),
    list: Effect.fn(function* () {
        const { organization } = yield* yield* Credentials;
        const databases = yield* planetscale.listDatabases
            .pages({ organization })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.data.filter((db) => db.kind === "mysql"))));
        const rows = yield* Effect.forEach(databases, (db) => planetscale.listBranches
            .pages({ organization, database: db.name })
            .pipe(Stream.runCollect, Effect.map((branchPages) => Array.from(branchPages).flatMap((page) => page.data.filter((branch) => branch.kind === "mysql"))), Effect.catchTag("NotFound", () => Effect.succeed([{ name: db.default_branch ?? "main" }])), Effect.flatMap((branches) => Effect.forEach(branches, (branch) => planetscale.listPasswords
            .pages({
            organization,
            database: db.name,
            branch: branch.name,
        })
            .pipe(Stream.runCollect, Effect.map((passwordPages) => Array.from(passwordPages).flatMap((page) => page.data.map((password) => buildAttributes(password, Redacted.make(""), {
            organization,
            database: db.name,
            branch: branch.name,
        })))), Effect.catchTag("NotFound", () => Effect.succeed([]))), { concurrency: 10 }).pipe(Effect.map((perBranch) => perBranch.flat())))), { concurrency: 10 });
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
const createPasswordName = (id, name) => Effect.gen(function* () {
    return (name ??
        (yield* createPhysicalName({ id, lowercase: true, maxLength: 63 })));
});
// Normalize the API's nullable `cidrs` field into the `string[] | undefined`
// shape we persist so downstream comparisons line up regardless of the
// API returning `null` vs `[]` vs an actual list.
const normalizeCidrs = (cidrs) => cidrs == null || cidrs.length === 0 ? undefined : cidrs;
const buildAttributes = (password, plaintext, context) => ({
    id: password.id,
    name: password.name,
    expiresAt: password.expires_at,
    host: password.access_host_url,
    username: password.username,
    password: plaintext,
    origin: {
        scheme: "mysql",
        host: password.access_host_url,
        port: 3306,
        database: context.database,
        user: password.username,
        password: plaintext,
    },
    organization: context.organization,
    database: context.database,
    branch: context.branch,
    role: password.role,
    replica: password.replica,
    ttl: password.ttl_seconds ?? undefined,
    cidrs: normalizeCidrs(password.cidrs),
});
//# sourceMappingURL=MySQLPassword.js.map