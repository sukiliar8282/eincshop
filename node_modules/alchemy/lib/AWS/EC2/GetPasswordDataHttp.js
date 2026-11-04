import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Layer from "effect/Layer";
import { makeInstanceHttpBinding } from "./BindingHttp.js";
import { GetPasswordData } from "./GetPasswordData.js";
export const GetPasswordDataHttp = Layer.effect(GetPasswordData, makeInstanceHttpBinding({
    tag: "AWS.EC2.GetPasswordData",
    operation: ec2.getPasswordData,
    actions: ["ec2:GetPasswordData"],
    requestKey: "InstanceId",
}));
//# sourceMappingURL=GetPasswordDataHttp.js.map