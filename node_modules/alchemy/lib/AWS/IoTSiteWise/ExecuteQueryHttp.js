import * as sitewise from "@distilled.cloud/aws/iotsitewise";
import * as Layer from "effect/Layer";
import { makeSiteWiseAccountHttpBinding } from "./BindingHttp.js";
import { ExecuteQuery } from "./ExecuteQuery.js";
export const ExecuteQueryHttp = Layer.effect(ExecuteQuery, makeSiteWiseAccountHttpBinding({
    capability: "ExecuteQuery",
    iamActions: ["iotsitewise:ExecuteQuery"],
    operation: sitewise.executeQuery,
}));
//# sourceMappingURL=ExecuteQueryHttp.js.map