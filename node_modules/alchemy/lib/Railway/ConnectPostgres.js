import * as Data from "effect/Data";
import * as Binding from "../Binding.js";
export const ConnectPostgres = Binding.Service("Railway.ConnectPostgres");
export const DATABASE_URL_SECRET = "DATABASE_URL";
export const DATABASE_PUBLIC_URL_SECRET = "DATABASE_PUBLIC_URL";
export const connectEnvKeys = (postgres) => {
    const id = postgres.LogicalId.replaceAll(/[^a-zA-Z0-9]/g, "_").toUpperCase();
    return {
        pooled: `RAILWAY_POSTGRES_${id}_POOLED`,
        direct: `RAILWAY_POSTGRES_${id}_DIRECT`,
    };
};
export class PostgresUrlMissing extends Data.TaggedError("Railway.PostgresUrlMissing") {
}
//# sourceMappingURL=ConnectPostgres.js.map