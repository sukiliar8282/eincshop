import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Layer from "effect/Layer";
import { makeInspector2AccountHttpBinding } from "./BindingHttp.js";
import { ListFindings } from "./ListFindings.js";
export const ListFindingsHttp = Layer.effect(ListFindings, makeInspector2AccountHttpBinding({
    tag: "AWS.Inspector2.ListFindings",
    operation: inspector2.listFindings,
    actions: ["inspector2:ListFindings"],
}));
//# sourceMappingURL=ListFindingsHttp.js.map