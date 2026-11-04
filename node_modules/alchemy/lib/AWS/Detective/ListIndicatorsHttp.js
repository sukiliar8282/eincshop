import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveGraphHttpBinding } from "./BindingHttp.js";
import { ListIndicators } from "./ListIndicators.js";
export const ListIndicatorsHttp = Layer.effect(ListIndicators, makeDetectiveGraphHttpBinding({
    tag: "AWS.Detective.ListIndicators",
    operation: detective.listIndicators,
    actions: ["detective:ListIndicators"],
}));
//# sourceMappingURL=ListIndicatorsHttp.js.map