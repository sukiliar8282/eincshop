import { deleteProject, getConnectionURI, getProject, getProjectOperation, listProjectBranchDatabases, listProjectBranches, listProjects, createProject as sdkCreateProject, updateProject, } from "@distilled.cloud/neon";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../Diff.js";
import { createPhysicalName } from "../PhysicalName.js";
import * as Provider from "../Provider.js";
import { Resource } from "../Resource.js";
import { diffMigrations, migrationsAttrs, migrationsInputOf, stampedOf, } from "../SQL/Migrations/index.js";
import { hashImports, hashMigrations, readSqlFile } from "../SQL/SqlFile.js";
import { recordsEqual } from "../Util/equal.js";
import { runPgMigrations, runSql } from "./Migrations.js";
import { parsePostgresOrigin } from "./PostgresOrigin.js";
const DEFAULT_REGION = "aws-us-east-1";
const DEFAULT_PG_VERSION = 17;
/**
 * A Neon serverless Postgres project.
 *
 * Creating a project also provisions the project's default branch (named
 * "main" by default), an initial role, an initial database, and a
 * read-write compute endpoint, exposed as `connectionUri`.
 * ### Creating a Project
 * **Example:** Basic project
 * ```typescript
 * const project = yield* Neon.Project("my-project");
 * ```
 *
 * **Example:** Project with explicit region and PG version
 * ```typescript
 * const project = yield* Neon.Project("my-project", {
 *   region: "aws-eu-central-1",
 *   pgVersion: 17,
 * });
 * ```
 *
 * **Example:** Project with logical replication enabled
 * ```typescript
 * const project = yield* Neon.Project("my-project", {
 *   enableLogicalReplication: true,
 * });
 * ```
 *
 * ### Migrations and seed data
 * **Example:** Apply migrations and seed files
 * ```typescript
 * const project = yield* Neon.Project("my-project", {
 *   migrations: "./migrations",
 *   importFiles: ["./seed/users.sql"],
 * });
 * ```
 *
 * ### Branching
 * **Example:** Create a branch off the project's default branch
 * ```typescript
 * const project = yield* Neon.Project("my-project");
 * const dev = yield* Neon.Branch("dev-branch", { project });
 * ```
 *
 * @see https://neon.tech/docs/manage/projects/
 *
 * @resource
 */
export const Project = Resource("Neon.Project");
export const ProjectProvider = () => Provider.succeed(Project, {
    stables: ["projectId", "defaultBranchId"],
    list: Effect.fn(function* () {
        // Account-scoped collection: enumerate every project via the Neon
        // projects list API, then hydrate each into the exact `read`
        // Attributes shape with bounded concurrency.
        const projects = yield* listAllProjects;
        const rows = yield* Effect.forEach(projects, (project) => hydrateProjectAttributes(project).pipe(
        // A project can be deleted between the list call and
        // hydration — skip it rather than fail the whole enumeration.
        Effect.catchTag("NotFound", () => Effect.succeed(undefined))), { concurrency: 10 });
        return rows.filter((row) => row !== undefined);
    }),
    diff: Effect.fn(function* ({ id, olds = {}, news = {}, output }) {
        if (!isResolved(news))
            return undefined;
        const oldName = output?.projectName ?? (yield* createProjectName(id, olds.name));
        // Auto-generated names are engine-owned: the deployed name stays
        // authoritative even if the generator would name this id differently
        // today. Only an explicit user-provided name can force a replace.
        const name = news.name ?? oldName;
        if (oldName !== name ||
            (news.region ?? output?.region ?? DEFAULT_REGION) !==
                (output?.region ?? olds.region ?? DEFAULT_REGION) ||
            (news.pgVersion ?? output?.pgVersion ?? DEFAULT_PG_VERSION) !==
                (output?.pgVersion ?? olds.pgVersion ?? DEFAULT_PG_VERSION) ||
            (news.defaultBranchName ?? output?.defaultBranchName) !==
                output?.defaultBranchName) {
            return { action: "replace" };
        }
        if ((news.historyRetentionSeconds ?? 86400) !==
            (output?.historyRetentionSeconds ?? 86400)) {
            return { action: "update" };
        }
        if ((news.enableLogicalReplication ?? false) !==
            (output?.enableLogicalReplication ?? false)) {
            return { action: "update" };
        }
        if (yield* diffMigrations({ news, output })) {
            return { action: "update" };
        }
        if (news.importFiles?.length) {
            const newHashes = yield* hashImports(news.importFiles, yield* rootDir);
            if (!recordsEqual(newHashes, output?.importHashes ?? {})) {
                return { action: "update" };
            }
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        if (output?.projectId) {
            return yield* getProject({ project_id: output.projectId }).pipe(Effect.map(({ project }) => ({
                ...output,
                projectName: project.name,
                pooledOrigin: output.pooledOrigin ??
                    parsePostgresOrigin(output.pooledConnectionUri),
                historyRetentionSeconds: project.history_retention_seconds,
                enableLogicalReplication: project.settings?.enable_logical_replication === true,
            })), Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
        }
        const name = yield* createProjectName(id, olds?.name);
        const matches = yield* findProjectByName(name);
        const match = matches[0];
        if (!match)
            return undefined;
        return yield* hydrateProjectAttributes(match, {
            defaultBranchName: olds?.defaultBranchName,
            migrationsDir: (olds && migrationsInputOf(olds))?.dir,
            migrationsTable: (olds && migrationsInputOf(olds))?.table,
        });
    }),
    reconcile: Effect.fn(function* ({ id, news = {}, output }) {
        // Ensure — when no prior output exists we create the project
        // (and let `read` upstream decide adoption); otherwise update
        // the mutable scalar fields on the existing project.
        const projectInfo = output
            ? yield* updateProject({
                project_id: output.projectId,
                project: {
                    name: news.name,
                    history_retention_seconds: news.historyRetentionSeconds,
                    settings: (news.enableLogicalReplication ?? false) !==
                        (output.enableLogicalReplication ?? false)
                        ? {
                            enable_logical_replication: news.enableLogicalReplication ?? false,
                        }
                        : undefined,
                },
            }).pipe(Effect.map((r) => ({
                projectId: output.projectId,
                projectName: r.project.name,
                region: output.region,
                pgVersion: output.pgVersion,
                defaultBranchId: output.defaultBranchId,
                defaultBranchName: output.defaultBranchName,
                databaseName: output.databaseName,
                roleName: output.roleName,
                connectionUri: output.connectionUri,
                pooledConnectionUri: output.pooledConnectionUri,
                origin: output.origin,
                pooledOrigin: output.pooledOrigin ??
                    parsePostgresOrigin(output.pooledConnectionUri),
                historyRetentionSeconds: r.project.history_retention_seconds ??
                    output.historyRetentionSeconds,
                enableLogicalReplication: r.project.settings?.enable_logical_replication === true,
            })))
            : yield* Effect.gen(function* () {
                const name = yield* createProjectName(id, news.name);
                const created = yield* sdkCreateProject({
                    project: {
                        name,
                        region_id: news.region,
                        pg_version: news.pgVersion,
                        branch: {
                            name: news.defaultBranchName,
                            role_name: news.roleName,
                            database_name: news.databaseName,
                        },
                        history_retention_seconds: news.historyRetentionSeconds,
                        org_id: news.orgId,
                        settings: news.enableLogicalReplication
                            ? { enable_logical_replication: true }
                            : undefined,
                    },
                });
                yield* waitForOperations(created.operations);
                const branchId = created.branch.id;
                const databaseName = getDatabaseName(created);
                const roleName = getRoleName(created) ?? "neondb_owner";
                const conn = yield* resolveConnection(created.project.id, branchId, databaseName, roleName);
                return {
                    projectId: created.project.id,
                    projectName: created.project.name,
                    region: created.project.region_id,
                    pgVersion: created.project.pg_version,
                    defaultBranchId: branchId,
                    defaultBranchName: created.branch.name,
                    databaseName,
                    roleName,
                    connectionUri: conn.uri,
                    pooledConnectionUri: conn.pooled,
                    origin: parsePostgresOrigin(conn.uri),
                    pooledOrigin: parsePostgresOrigin(conn.pooled),
                    historyRetentionSeconds: created.project.history_retention_seconds ?? 86400,
                    enableLogicalReplication: created.project.settings?.enable_logical_replication === true,
                };
            });
        const connectionUri = Redacted.make(projectInfo.connectionUri);
        const migrationsInput = migrationsInputOf(news);
        const migrations = migrationsInput
            ? yield* runPgMigrations({
                connectionUri,
                input: migrationsInput,
                stamped: stampedOf(output),
            })
            : undefined;
        const importHashes = news.importFiles?.length
            ? yield* runImports(connectionUri, news.importFiles, yield* rootDir, output?.importHashes ?? {})
            : {};
        return {
            ...projectInfo,
            ...migrationsAttrs({ input: migrationsInput, run: migrations, output }),
            importHashes,
        };
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* deleteProject({ project_id: output.projectId }).pipe(Effect.tapError(Console.log), Effect.catchTag("NotFound", () => Effect.void));
    }),
});
const rootDir = Effect.sync(process.cwd);
const createProjectName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id }));
});
const getRoleName = (creation) => creation.roles.find((r) => !r.protected)?.name ?? creation.roles[0]?.name;
const getDatabaseName = (creation) => creation.databases[0]?.name ?? "neondb";
const resolveConnection = (projectId, branchId, databaseName, roleName) => Effect.gen(function* () {
    const direct = yield* getConnectionURI({
        project_id: projectId,
        branch_id: branchId,
        database_name: databaseName,
        role_name: roleName,
        pooled: false,
    });
    const pooled = yield* getConnectionURI({
        project_id: projectId,
        branch_id: branchId,
        database_name: databaseName,
        role_name: roleName,
        pooled: true,
    });
    return { uri: direct.uri, pooled: pooled.uri };
});
class OperationFailed extends Data.TaggedError("OperationFailed") {
}
class OperationPending extends Data.TaggedError("OperationPending") {
}
const isOperationComplete = (status) => status === "finished" ||
    status === "failed" ||
    status === "error" ||
    status === "cancelled" ||
    status === "skipped";
/**
 * Wait for the given operations to reach a terminal state. Polls every
 * 500ms with exponential backoff up to ~30s per operation.
 */
export const waitForOperations = (operations) => Effect.gen(function* () {
    for (const op of operations) {
        if (isOperationComplete(op.status)) {
            if (op.status === "failed" || op.status === "error") {
                return yield* new OperationFailed({
                    operationId: op.id,
                    action: op.action,
                    status: op.status,
                    error: op.error,
                });
            }
            continue;
        }
        yield* getProjectOperation({
            project_id: op.project_id,
            operation_id: op.id,
        }).pipe(Effect.flatMap(({ operation, }) => {
            const status = operation.status;
            if (status === "failed" || status === "error") {
                return Effect.fail(new OperationFailed({
                    operationId: operation.id,
                    action: operation.action,
                    status,
                    error: operation.error,
                }));
            }
            if (!isOperationComplete(status)) {
                return Effect.fail(new OperationPending({ operationId: op.id }));
            }
            return Effect.void;
        }), Effect.retry({
            while: (e) => {
                const tag = e._tag;
                return (tag === "OperationPending" ||
                    tag === "TooManyRequests" ||
                    tag === "ServiceUnavailable" ||
                    tag === "InternalServerError" ||
                    tag === "BadGateway" ||
                    tag === "GatewayTimeout");
            },
            schedule: Schedule.max([
                Schedule.exponential(Duration.millis(500), 1.5),
                Schedule.recurs(60),
            ]),
        }), Effect.catchTag("OperationPending", () => Effect.void));
    }
});
const findProjectByName = (name) => Effect.gen(function* () {
    const matches = [];
    let cursor;
    while (true) {
        const page = yield* listProjects({
            search: name,
            ...(cursor !== undefined ? { cursor } : {}),
        });
        for (const p of page.projects) {
            if (p.name === name)
                matches.push(p);
        }
        const nextCursor = page.pagination?.cursor;
        // Neon returns a `pagination.cursor` on every response — it's the
        // `created_at` of the last row, not a "has next page" flag — so we
        // can't loop on cursor presence alone or we spin forever re-fetching
        // empty/identical pages. Stop once a page comes back empty or the
        // cursor stops advancing.
        if (page.projects.length === 0 ||
            nextCursor === undefined ||
            nextCursor === cursor) {
            break;
        }
        cursor = nextCursor;
    }
    return matches;
});
/**
 * Exhaustively enumerate every project in the account. Uses the same
 * cursor-stop heuristic as {@link findProjectByName} because Neon returns a
 * `pagination.cursor` on every page (it's the last row's `created_at`, not a
 * "has next page" flag), so we'd otherwise loop forever re-fetching.
 */
const listAllProjects = Effect.gen(function* () {
    const projects = [];
    let cursor;
    while (true) {
        const page = yield* listProjects(cursor !== undefined ? { cursor } : {});
        projects.push(...page.projects);
        const nextCursor = page.pagination?.cursor;
        if (page.projects.length === 0 ||
            nextCursor === undefined ||
            nextCursor === cursor) {
            break;
        }
        cursor = nextCursor;
    }
    return projects;
});
/**
 * Hydrate a project summary (from the list API) into the exact `read`
 * Attributes shape — resolving the default branch, its primary database, and
 * the direct + pooled connection URIs. Returns `undefined` when the project
 * has no branch or database yet (mirrors `read`).
 */
const hydrateProjectAttributes = (project, opts = {}) => Effect.gen(function* () {
    const branches = yield* listProjectBranches({
        project_id: project.id,
        search: opts.defaultBranchName ?? "main",
    });
    const defaultBranch = branches.branches.find((b) => b.default) ?? branches.branches[0];
    if (!defaultBranch)
        return undefined;
    const databases = yield* listProjectBranchDatabases({
        project_id: project.id,
        branch_id: defaultBranch.id,
    });
    const db = databases.databases[0];
    if (!db)
        return undefined;
    const conn = yield* resolveConnection(project.id, defaultBranch.id, db.name, db.owner_name);
    return {
        projectId: project.id,
        projectName: project.name,
        region: project.region_id,
        pgVersion: project.pg_version,
        defaultBranchId: defaultBranch.id,
        defaultBranchName: defaultBranch.name,
        databaseName: db.name,
        roleName: db.owner_name,
        connectionUri: conn.uri,
        pooledConnectionUri: conn.pooled,
        origin: parsePostgresOrigin(conn.uri),
        pooledOrigin: parsePostgresOrigin(conn.pooled),
        historyRetentionSeconds: project.history_retention_seconds ?? 86400,
        enableLogicalReplication: project.settings?.enable_logical_replication === true,
        migrationsDir: opts.migrationsDir,
        migrationsTable: opts.migrationsTable,
        migrationsHashes: {},
        importHashes: {},
    };
});
const runImports = (connectionUri, importFiles, rootDir, previous) => Effect.gen(function* () {
    const hashes = { ...previous };
    for (const filePath of importFiles) {
        const file = yield* readSqlFile(rootDir, filePath);
        if (previous[filePath] === file.hash) {
            hashes[filePath] = file.hash;
            continue;
        }
        yield* runSql(connectionUri, file.sql);
        hashes[filePath] = file.hash;
    }
    const tracked = new Set(importFiles);
    for (const key of Object.keys(hashes)) {
        if (!tracked.has(key))
            delete hashes[key];
    }
    return hashes;
});
//# sourceMappingURL=Project.js.map