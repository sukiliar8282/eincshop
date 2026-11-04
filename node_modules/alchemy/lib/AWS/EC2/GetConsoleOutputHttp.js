import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Layer from "effect/Layer";
import { makeInstanceHttpBinding } from "./BindingHttp.js";
import { GetConsoleOutput } from "./GetConsoleOutput.js";
export const GetConsoleOutputHttp = Layer.effect(GetConsoleOutput, makeInstanceHttpBinding({
    tag: "AWS.EC2.GetConsoleOutput",
    operation: ec2.getConsoleOutput,
    actions: ["ec2:GetConsoleOutput"],
    requestKey: "InstanceId",
}));
//# sourceMappingURL=GetConsoleOutputHttp.js.map