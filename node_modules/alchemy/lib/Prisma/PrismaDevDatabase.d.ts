import * as Effect from "effect/Effect";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import type { Server } from "@prisma/dev";
import type { DatabaseDev } from "./Database.ts";
export interface PrismaDevDatabaseAttrs {
    directConnectionString: Redacted.Redacted<string>;
    pooledConnectionString: Redacted.Redacted<string>;
    accelerateConnectionString: Redacted.Redacted<string>;
    host: string | null;
    user: string | null;
    password: Redacted.Redacted<string> | undefined;
}
export declare const prismaDevDatabaseAttrsFromServer: (server: Server) => Effect.Effect<{
    directConnectionString: Redacted.Redacted<string>;
    pooledConnectionString: Redacted.Redacted<string>;
    accelerateConnectionString: Redacted.Redacted<string>;
    host: string | null;
    user: string | null;
    password: Redacted.Redacted<string> | undefined;
}, Error, never>;
export declare const ensurePrismaDevDatabase: (databaseId: string, dev: false | DatabaseDev | undefined) => Effect.Effect<PrismaDevDatabaseAttrs | undefined, Error | import("effect/PlatformError").PlatformError, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | Path.Path>;
export declare const closePrismaDevDatabase: (databaseId: string) => Effect.Effect<void, Error, never>;
export declare const closePrismaDevDatabases: () => Effect.Effect<undefined, Error, never>;
//# sourceMappingURL=PrismaDevDatabase.d.ts.map