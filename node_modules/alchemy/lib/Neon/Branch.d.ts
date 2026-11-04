import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { type MigrationsInput } from "../SQL/Migrations/index.ts";
import { type PostgresOrigin } from "./PostgresOrigin.ts";
import { type Project } from "./Project.ts";
import type { Providers } from "./Providers.ts";
export type BranchSource = Project | {
    projectId: string;
};
export type ParentBranchSource = Branch | {
    branchId: string;
} | {
    name: string;
};
export type BranchEndpointConfig = {
    type: "read_only" | "read_write";
    autoscalingLimitMinCu?: number;
    autoscalingLimitMaxCu?: number;
    suspendTimeoutSeconds?: number;
};
export type BranchProps = {
    /**
     * The Neon project (or `{ projectId }`) to create the branch in.
     */
    project: BranchSource;
    /**
     * Branch name. If omitted, a unique name is generated from
     * `${app}-${stage}-${id}`.
     */
    name?: string;
    /**
     * The parent branch to fork from. Accepts a `Branch`, a
     * `{ branchId }`, or `{ name }` to look up by name. Defaults to the
     * project's default branch.
     */
    parentBranch?: ParentBranchSource;
    /**
     * A Log Sequence Number on the parent branch. The new branch is created
     * with parent data as of this LSN.
     */
    parentLsn?: string;
    /**
     * An ISO-8601 timestamp identifying a point in time on the parent branch
     * to fork from.
     */
    parentTimestamp?: string;
    /**
     * Whether the branch is protected from deletion / mutation.
     *
     * @default false
     */
    protected?: boolean;
    /**
     * Initialization source.
     *
     * - `parent-data` (default) — copy schema and data from the parent.
     * - `schema-only` — copy only the schema.
     */
    initSource?: "schema-only" | "parent-data";
    /**
     * RFC-3339 timestamp at which Neon should auto-delete the branch.
     * Useful for ephemeral preview branches.
     */
    expiresAt?: string;
    /**
     * Endpoints to create for the branch. At least one `read-write` endpoint
     * is required to connect to the branch.
     *
     * @default [{ type: "read_write" }]
     */
    endpoints?: BranchEndpointConfig[];
    /**
     * SQL migrations to apply against the branch. Accepts a directory path, a
     * `Drizzle.Schema` resource, or `{ dir, table? }`.
     *
     * Bookkeeping always lives in Alchemy's `__alchemy_migrations` table. A
     * database previously migrated by drizzle-kit or Prisma is adopted by a
     * one-way conversion on first deploy: the old tool's applied history is
     * copied into Alchemy's table and the old table is left frozen. No
     * baselining required.
     */
    migrations?: MigrationsInput;
    /**
     * Paths to additional `.sql` files to apply after migrations.
     */
    importFiles?: string[];
};
export type Branch = Resource<"Neon.Branch", BranchProps, {
    branchId: string;
    branchName: string;
    projectId: string;
    parentBranchId: string | undefined;
    parentLsn: string | undefined;
    parentTimestamp: string | undefined;
    initSource: "schema-only" | "parent-data" | undefined;
    protected: boolean;
    default: boolean;
    expiresAt: string | undefined;
    databaseName: string;
    roleName: string;
    /** Postgres connection URI for the branch's primary database. */
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
    migrationsDir: string | undefined;
    migrationsTable: string | undefined;
    migrationsHashes: Record<string, string>;
    importHashes: Record<string, string>;
}, never, Providers>;
/**
 * A branch of a Neon project.
 *
 * Branches are first-class, copy-on-write copies of a parent branch — they
 * share storage with the parent until the new branch starts diverging.
 * ### Branching from a project's default branch
 * **Example:** Basic branch
 * ```typescript
 * const project = yield* Neon.Project("my-project");
 * const dev = yield* Neon.Branch("dev-branch", { project });
 * ```
 *
 * ### Branching from another branch
 * **Example:** Branch off another branch
 * ```typescript
 * const dev = yield* Neon.Branch("dev", { project });
 * const featureBranch = yield* Neon.Branch("feature", {
 *   project,
 *   parentBranch: dev,
 * });
 * ```
 *
 * ### Point-in-time branches
 * **Example:** Branch from a parent at a specific LSN
 * ```typescript
 * const branch = yield* Neon.Branch("at-lsn", {
 *   project,
 *   parentLsn: "0/3FA01B0",
 * });
 * ```
 *
 * ### Migrations on a branch
 * **Example:** Apply migrations on the branch only
 * ```typescript
 * const featureBranch = yield* Neon.Branch("feature", {
 *   project,
 *   migrations: "./migrations",
 * });
 * ```
 *
 * @see https://neon.tech/docs/manage/branches/
 *
 * @resource
 */
export declare const Branch: import("../Resource.ts").ResourceClass<Branch>;
export declare const BranchProvider: () => import("effect/Layer").Layer<Provider.Provider<Branch>, never, import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../Stack.ts").Stack | import("../Stage.ts").Stage | import("@distilled.cloud/neon").NeonOpContext>;
//# sourceMappingURL=Branch.d.ts.map