import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { CredentialsStoreLive } from "../Auth/Credentials.js";
import { ProfileStoreLive } from "../Auth/Profile.js";
import * as Provider from "../Provider.js";
import { PlanetscaleAuth } from "./AuthProvider.js";
import * as Credentials from "./Credentials.js";
import { MySQLBranch, MySQLBranchProvider } from "./MySQL/MySQLBranch.js";
import { MySQLDatabase, MySQLDatabaseProvider } from "./MySQL/MySQLDatabase.js";
import { MySQLPassword, MySQLPasswordProvider } from "./MySQL/MySQLPassword.js";
import { PostgresBranch, PostgresBranchProvider, } from "./Postgres/PostgresBranch.js";
import { PostgresDatabase, PostgresDatabaseProvider, } from "./Postgres/PostgresDatabase.js";
import { PostgresDefaultRole, PostgresDefaultRoleProvider, } from "./Postgres/PostgresDefaultRole.js";
import { PostgresRole, PostgresRoleProvider } from "./Postgres/PostgresRole.js";
/**
 * Service tag bundling all PlanetScale providers + auth + credentials. Use
 * `Planetscale.providers()` to materialize the full layer.
 */
export class Providers extends Provider.ProviderCollection()("Planetscale") {
}
/**
 * Build the complete PlanetScale providers Layer. Provide this on a Stack
 * (or via `Effect.provide` at test time) to enable all PlanetScale
 * resources, the AuthProvider registration, and credential resolution.
 *
 * @example
 * ```ts
 * Effect.provide(Planetscale.providers())
 * ```
 */
export const providers = () => Layer.effect(Providers, Provider.collection([
    MySQLDatabase,
    PostgresDatabase,
    MySQLBranch,
    PostgresBranch,
    MySQLPassword,
    PostgresRole,
    PostgresDefaultRole,
])).pipe(Layer.provide(Layer.mergeAll(MySQLDatabaseProvider(), PostgresDatabaseProvider(), MySQLBranchProvider(), PostgresBranchProvider(), MySQLPasswordProvider(), PostgresRoleProvider(), PostgresDefaultRoleProvider())), Layer.provideMerge(Credentials.fromAuthProvider()), Layer.provideMerge(FetchHttpClient.layer), Layer.provideMerge(PlanetscaleAuth), Layer.provideMerge(ProfileStoreLive), Layer.provideMerge(CredentialsStoreLive), Layer.orDie);
//# sourceMappingURL=Providers.js.map