import * as Data from "effect/Data";
import * as Binding from "../Binding.js";
export const ConnectMySQL = Binding.Service("Railway.ConnectMySQL");
export const connectEnvKeys = (mysql) => {
    const id = mysql.LogicalId.replaceAll(/[^a-zA-Z0-9]/g, "_").toUpperCase();
    return {
        pooled: `RAILWAY_MYSQL_${id}_POOLED`,
        direct: `RAILWAY_MYSQL_${id}_DIRECT`,
    };
};
export class MySQLUrlMissing extends Data.TaggedError("Railway.MySQLUrlMissing") {
}
//# sourceMappingURL=ConnectMySQL.js.map