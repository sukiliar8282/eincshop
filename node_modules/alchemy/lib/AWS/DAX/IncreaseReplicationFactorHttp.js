import * as dax from "@distilled.cloud/aws/dax";
import * as Layer from "effect/Layer";
import { makeDaxClusterHttpBinding } from "./BindingHttp.js";
import { IncreaseReplicationFactor } from "./IncreaseReplicationFactor.js";
export const IncreaseReplicationFactorHttp = Layer.effect(IncreaseReplicationFactor, makeDaxClusterHttpBinding({
    tag: "AWS.DAX.IncreaseReplicationFactor",
    operation: dax.increaseReplicationFactor,
    actions: ["dax:IncreaseReplicationFactor"],
}));
//# sourceMappingURL=IncreaseReplicationFactorHttp.js.map