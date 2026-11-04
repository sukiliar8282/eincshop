import * as Effect from "effect/Effect";
import type { Input } from "../Input.ts";
import type { App } from "./App.ts";
import type { Bucket } from "./Bucket.ts";
import type { Database } from "./Database.ts";
import type { Project } from "./Project.ts";
export type InputObject<T extends object> = {
    [Key in keyof T]: Input<T[Key]>;
};
export declare const isInputObject: <T extends object>(value: Input<T>) => value is InputObject<T> & Input<T>;
export declare const isPrismaDevId: (value: unknown) => value is string;
export declare const concreteIdOf: (value: unknown) => string | undefined;
export declare const concreteIdsChanged: (oldId: string | undefined, newId: string | undefined) => boolean;
export declare const unresolvedProjectIdOf: (project: string | Project | undefined) => string | undefined;
export declare const resolveProjectId: (project: string | Project) => Effect.Effect<string, Error, any>;
export declare const unresolvedDatabaseIdOf: (database: string | Database | undefined) => string | undefined;
export declare const resolveDatabaseId: (database: string | Database) => Effect.Effect<string, Error, any>;
export declare const unresolvedBucketIdOf: (bucket: string | Bucket | undefined) => string | undefined;
export declare const resolveBucketId: (bucket: string | Bucket) => Effect.Effect<string, Error, any>;
export declare const unresolvedAppIdOf: (app: string | App | undefined) => string | undefined;
export declare const resolveAppId: (app: string | App) => Effect.Effect<string, Error, any>;
//# sourceMappingURL=Refs.d.ts.map