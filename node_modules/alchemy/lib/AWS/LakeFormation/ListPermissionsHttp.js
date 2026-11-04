import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Layer from "effect/Layer";
import { makeLakeFormationHttpBinding } from "./BindingHttp.js";
import { ListPermissions } from "./ListPermissions.js";
export const ListPermissionsHttp = Layer.effect(ListPermissions, makeLakeFormationHttpBinding({
    capability: "ListPermissions",
    iamActions: ["lakeformation:ListPermissions"],
    operation: lf.listPermissions,
}));
//# sourceMappingURL=ListPermissionsHttp.js.map