import { Resource } from "../../Resource.js";
import { makeBranchProvider, } from "../Branch.js";
import { runMySQLImports, runMySQLMigrations } from "./MySQLMigrations.js";
/** @resource */
export const MySQLBranch = Resource("Planetscale.MySQLBranch");
export const MySQLBranchProvider = () => makeBranchProvider({
    resource: MySQLBranch,
    expectedKind: "mysql",
    engineLabel: "MySQLBranch",
    runners: {
        runMigrations: runMySQLMigrations,
        runImports: runMySQLImports,
    },
});
//# sourceMappingURL=MySQLBranch.js.map