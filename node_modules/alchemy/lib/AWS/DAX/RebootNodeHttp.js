import * as dax from "@distilled.cloud/aws/dax";
import * as Layer from "effect/Layer";
import { makeDaxClusterHttpBinding } from "./BindingHttp.js";
import { RebootNode } from "./RebootNode.js";
export const RebootNodeHttp = Layer.effect(RebootNode, makeDaxClusterHttpBinding({
    tag: "AWS.DAX.RebootNode",
    operation: dax.rebootNode,
    actions: ["dax:RebootNode"],
}));
//# sourceMappingURL=RebootNodeHttp.js.map