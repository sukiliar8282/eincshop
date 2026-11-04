import { Resource } from "../../Resource.js";
import { makeBranchProvider, } from "../Branch.js";
import { runPostgresImports, runPostgresMigrations, } from "./PostgresMigrations.js";
/** @resource */
export const PostgresBranch = Resource("Planetscale.PostgresBranch");
export const PostgresBranchProvider = () => makeBranchProvider({
    resource: PostgresBranch,
    expectedKind: "postgresql",
    engineLabel: "PostgresBranch",
    runners: {
        runMigrations: runPostgresMigrations,
        runImports: runPostgresImports,
    },
});
//# sourceMappingURL=PostgresBranch.js.map