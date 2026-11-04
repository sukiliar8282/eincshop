import * as vpclattice from "@distilled.cloud/aws/vpc-lattice";
import * as Layer from "effect/Layer";
import { makeVpcLatticeTargetGroupHttpBinding } from "./BindingHttp.js";
import { ListTargets } from "./ListTargets.js";
export const ListTargetsHttp = Layer.effect(ListTargets, makeVpcLatticeTargetGroupHttpBinding({
    tag: "AWS.VpcLattice.ListTargets",
    operation: vpclattice.listTargets,
    actions: ["vpc-lattice:ListTargets"],
}));
//# sourceMappingURL=ListTargetsHttp.js.map