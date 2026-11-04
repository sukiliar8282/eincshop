import * as repostspace from "@distilled.cloud/aws/repostspace";
import * as Layer from "effect/Layer";
import { makeRePostSpaceHttpBinding } from "./BindingHttp.js";
import { RegisterAdmin } from "./RegisterAdmin.js";
export const RegisterAdminHttp = Layer.effect(RegisterAdmin, makeRePostSpaceHttpBinding({
    tag: "AWS.RePostSpace.RegisterAdmin",
    operation: repostspace.registerAdmin,
    actions: ["repostspace:RegisterAdmin"],
}));
//# sourceMappingURL=RegisterAdminHttp.js.map