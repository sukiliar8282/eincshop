import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveGraphHttpBinding } from "./BindingHttp.js";
import { UpdateDatasourcePackages } from "./UpdateDatasourcePackages.js";
export const UpdateDatasourcePackagesHttp = Layer.effect(UpdateDatasourcePackages, makeDetectiveGraphHttpBinding({
    tag: "AWS.Detective.UpdateDatasourcePackages",
    operation: detective.updateDatasourcePackages,
    actions: ["detective:UpdateDatasourcePackages"],
}));
//# sourceMappingURL=UpdateDatasourcePackagesHttp.js.map