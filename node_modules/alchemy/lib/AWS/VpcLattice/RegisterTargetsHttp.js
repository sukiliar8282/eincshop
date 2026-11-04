import * as vpclattice from "@distilled.cloud/aws/vpc-lattice";
import * as Layer from "effect/Layer";
import { makeVpcLatticeTargetGroupHttpBinding } from "./BindingHttp.js";
import { RegisterTargets } from "./RegisterTargets.js";
export const RegisterTargetsHttp = Layer.effect(RegisterTargets, makeVpcLatticeTargetGroupHttpBinding({
    tag: "AWS.VpcLattice.RegisterTargets",
    operation: vpclattice.registerTargets,
    actions: ["vpc-lattice:RegisterTargets"],
}));
//# sourceMappingURL=RegisterTargetsHttp.js.map