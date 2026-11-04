import * as sfn from "@distilled.cloud/aws/sfn";
import * as Layer from "effect/Layer";
import { makeSfnServiceHttpBinding } from "./BindingHttp.js";
import { ValidateStateMachineDefinition } from "./ValidateStateMachineDefinition.js";
export const ValidateStateMachineDefinitionHttp = Layer.effect(ValidateStateMachineDefinition, makeSfnServiceHttpBinding({
    tag: "AWS.StepFunctions.ValidateStateMachineDefinition",
    actions: ["states:ValidateStateMachineDefinition"],
    operation: sfn.validateStateMachineDefinition,
}));
//# sourceMappingURL=ValidateStateMachineDefinitionHttp.js.map