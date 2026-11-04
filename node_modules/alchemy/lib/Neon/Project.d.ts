import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { type MigrationsInput } from "../SQL/Migrations/index.ts";
import { type PostgresOrigin } from "./PostgresOrigin.ts";
import type { Providers } from "./Providers.ts";
export type NeonRegion = "aws-us-east-1" | "aws-us-east-2" | "aws-us-west-2" | "aws-eu-central-1" | "aws-eu-west-2" | "aws-ap-southeast-1" | "aws-ap-southeast-2" | "aws-sa-east-1" | "azure-eastus2" | "azure-westus3" | "azure-gwc";
export type NeonPgVersion = 14 | 15 | 16 | 17 | 18;
export type ProjectProps = {
    /**
     * Name of the project. If omitted, a unique name is generated from
     * `${app}-${stage}-${id}`.
     */
    name?: string;
    /**
     * Region where the project is provisioned. Cannot be changed after
     * creation.
     *
     * @default "aws-us-east-1"
     */
    region?: NeonRegion;
    /**
     * Postgres version. Cannot be changed after creation.
     *
     * @default 17
     */
    pgVersion?: NeonPgVersion;
    /**
     * Name of the default branch. Defaults to Neon's default ("main"). Cannot
     * be changed after creation.
     */
    defaultBranchName?: string;
    /**
     * Name of the default role created with the project. Defaults to
     * `neondb_owner`. Cannot be changed after creation.
     */
    roleName?: string;
    /**
     * Name of the default database created with the project. Defaults to
     * `neondb`. Cannot be changed after creation.
     */
    databaseName?: string;
    /**
     * Number of seconds of WAL history retained on the project for
     * point-in-time branching/restore.
     *
     * @default 86400
     */
    historyRetentionSeconds?: number;
    /**
     * Optional Neon organization ID. Cannot be changed after creation.
     */
    orgId?: string;
    /**
     * Enable Postgres logical replication on the project. Once enabled,
     * Neon does not support disabling it again.
     *
     * @default false
     * @see https://neon.tech/docs/guides/logical-replication-neon
     */
    enableLogicalReplication?: boolean;
    /**
     * SQL migrations to apply against the default branch's primary database.
     * Accepts a directory path, a `Drizzle.Schema` resource, or
     * `{ dir, table? }`.
     *
     * Bookkeeping always lives in Alchemy's `__alchemy_migrations` table. A
     * database previously migrated by drizzle-kit or Prisma is adopted by a
     * one-way conversion on first deploy: the old tool's applied history is
     * copied into Alchemy's table and the old table is left frozen. No
     * baselining required.
     */
    migrations?: MigrationsInput;
    /**
     * Paths to additional `.sql` files to apply after migrations. Each file
     * is hashed; only files whose contents change are re-applied on
     * subsequent deploys.
     */
    importFiles?: string[];
};
export type Project = Resource<"Neon.Project", ProjectProps, {
    projectId: string;
    projectName: string;
    region: NeonRegion;
    pgVersion: NeonPgVersion;
    defaultBranchId: string;
    defaultBranchName: string;
    databaseName: string;
    roleName: string;
    /** Postgres connection URI for the default branch + database. */
    connectionUri: string;
    /** Pooled connection URI (uses pgbouncer). */
    pooledConnectionUri: string;
    /**
     * Parsed connection components ready to feed into a Postgres origin
     * — e.g. `Cloudflare.Hyperdrive`'s `origin` prop. Points at the
     * direct (non-pooled) endpoint, which is the recommended target
     * when fronting Neon with another pooler like Hyperdrive.
     */
    origin: PostgresOrigin;
    /**
     * Parsed pooled connection components. Useful as a Hyperdrive `dev`
     * origin when local workers bypass Hyperdrive and connect directly.
     */
    pooledOrigin: PostgresOrigin;
    historyRetentionSeconds: number;
    enableLogicalReplication: boolean;
    migrationsDir: string | undefined;
    migrationsTable: string | undefined;
    migrationsHashes: Record<string, string>;
    importHashes: Record<string, string>;
}, never, Providers>;
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
export declare const Project: import("../Resource.ts").ResourceClass<Project>;
export declare const ProjectProvider: () => import("effect/Layer").Layer<Provider.Provider<Project>, never, import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../Stack.ts").Stack | import("../Stage.ts").Stage | import("@distilled.cloud/neon").NeonOpContext>;
declare const OperationFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "OperationFailed";
} & Readonly<A>;
declare class OperationFailed extends OperationFailed_base<{
    operationId: string;
    action: string;
    status: NeonOperationStatus;
    error?: string;
}> {
}
type NeonOperationStatus = "scheduling" | "running" | "finished" | "failed" | "error" | "cancelling" | "cancelled" | "skipped" | (string & {});
/**
 * Wait for the given operations to reach a terminal state. Polls every
 * 500ms with exponential backoff up to ~30s per operation.
 */
export declare const waitForOperations: (operations: ReadonlyArray<{
    readonly id: string;
    readonly project_id: string;
    readonly action: string;
    readonly status: NeonOperationStatus;
    readonly error?: string;
}>) => Effect.Effect<undefined, OperationFailed | import("@distilled.cloud/neon").GetProjectOperationError, import("@distilled.cloud/neon").NeonOpContext>;
export {};
//# sourceMappingURL=Project.d.ts.map