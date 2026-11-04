import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import type { ResourceClass, ResourceLike } from "../Resource.ts";
import { type MigrationRun, type MigrationsInput, type NormalizedMigrationsInput, type StampedMigrationsState } from "../SQL/Migrations/index.ts";
/**
 * Props shared between {@link MySQLBranch} and {@link PostgresBranch}. The
 * `database` and `parentBranch` fields are typed by each engine's resource.
 */
export interface BaseBranchProps {
    /**
     * Branch name. If omitted, a name is generated from the stack/stage/id.
     */
    name?: string;
    /**
     * If provided, restores the backup's schema and data to the new branch.
     * Ignored if the branch already exists.
     */
    backupId?: string;
    /**
     * If provided, restores the last successful backup's schema and data.
     * Ignored if the branch already exists.
     */
    seedData?: "last_successful_backup";
    /**
     * Whether safe migrations are enabled on the branch.
     */
    safeMigrations?: boolean;
    /**
     * Region in which to create the branch. Defaults to the database's
     * region. The actual region is validated on adopt/update.
     */
    region?: {
        slug: string;
    };
    /**
     * SQL migrations to apply against this branch. Accepts a directory path,
     * a `Drizzle.Schema` resource, or `{ dir, table? }`. Bookkeeping lives
     * in Alchemy's `__alchemy_migrations` table; drizzle/prisma history is
     * converted one-way on first deploy.
     */
    migrations?: MigrationsInput;
    /**
     * Paths to additional `.sql` files to apply after migrations. Each file is
     * hashed; only files whose contents change are re-applied on later deploys.
     */
    importFiles?: string[];
}
/**
 * Attributes shared between {@link MySQLBranch} and {@link PostgresBranch}.
 */
export interface BaseBranchAttributes {
    /** The branch name. */
    name: string;
    /** The PlanetScale organization slug. */
    organization: string;
    /** The database name. */
    database: string;
    /** The parent branch name. */
    parentBranch: string;
    /** Whether this is a production branch. */
    production: boolean;
    /** Time at which the branch was created (ISO 8601). */
    createdAt: string;
    /** Time at which the branch was last updated (ISO 8601). */
    updatedAt: string;
    /** HTML URL for accessing the branch in the dashboard. */
    htmlUrl: string;
    /** The region of the branch as reported by PlanetScale. */
    region: {
        slug: string;
    };
    /** Directory containing migration files, if configured. */
    migrationsDir: string | undefined;
    /** Table used to track applied migrations, if configured. */
    migrationsTable: string | undefined;
    /** Content hashes for the last applied migration files. */
    migrationsHashes: Record<string, string>;
    /** Content hashes for the last applied import files. */
    importHashes: Record<string, string>;
    /**
     * Desired total replica count requested by the resource input, when known.
     * PlanetScale's branch read API exposes only boolean HA state, so this is
     * persisted from Alchemy state rather than observed from live provider data.
     */
    desiredReplicas: number | undefined;
    /** Whether the branch currently has HA replicas. */
    hasReplicas: boolean | undefined;
    /** Whether the branch currently has read-only replicas. */
    hasReadOnlyReplicas: boolean | undefined;
}
/**
 * Shape of the engine-specific migration runners used by
 * {@link makeBranchProvider}. MySQL and Postgres each supply their own
 * implementations in their respective `*Migrations.ts` modules.
 */
export interface BranchMigrationRunners {
    runMigrations: (target: {
        organization: string;
        database: string;
        branch: string;
    }, input: NormalizedMigrationsInput, stamped: StampedMigrationsState) => Effect.Effect<MigrationRun, any, any>;
    runImports: (target: {
        organization: string;
        database: string;
        branch: string;
    }, importFiles: string[], rootDir: string, previousHashes: Record<string, string>) => Effect.Effect<Record<string, string>, any, any>;
}
/**
 * Build a branch provider for a specific PlanetScale engine. The
 * caller supplies the typed `Resource` token and the engine's migration
 * runners; everything else (observe / ensure / sync / delete) is shared.
 */
export declare const makeBranchProvider: <R extends ResourceLike>(opts: {
    resource: ResourceClass<R>;
    expectedKind: "mysql" | "postgresql";
    engineLabel: string;
    runners: BranchMigrationRunners;
}) => import("effect/Layer").Layer<Provider.Provider<R>, never, never>;
//# sourceMappingURL=Branch.d.ts.map