import * as sfn from "@distilled.cloud/aws/sfn";
import * as Layer from "effect/Layer";
import { makeSfnServiceHttpBinding } from "./BindingHttp.js";
import { TestState } from "./TestState.js";
export const TestStateHttp = Layer.effect(TestState, makeSfnServiceHttpBinding({
    tag: "AWS.StepFunctions.TestState",
    actions: ["states:TestState"],
    operation: sfn.testState,
}));
//# sourceMappingURL=TestStateHttp.js.map