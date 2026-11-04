import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveGraphHttpBinding } from "./BindingHttp.js";
import { ListDatasourcePackages } from "./ListDatasourcePackages.js";
export const ListDatasourcePackagesHttp = Layer.effect(ListDatasourcePackages, makeDetectiveGraphHttpBinding({
    tag: "AWS.Detective.ListDatasourcePackages",
    operation: detective.listDatasourcePackages,
    actions: ["detective:ListDatasourcePackages"],
}));
//# sourceMappingURL=ListDatasourcePackagesHttp.js.map