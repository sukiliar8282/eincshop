import * as greengrassv2 from "@distilled.cloud/aws/greengrassv2";
import * as Layer from "effect/Layer";
import { makeGreengrassComponentHttpBinding } from "./BindingHttp.js";
import { GetComponent } from "./GetComponent.js";
export const GetComponentHttp = Layer.effect(GetComponent, makeGreengrassComponentHttpBinding({
    tag: "AWS.GreengrassV2.GetComponent",
    operation: greengrassv2.getComponent,
    actions: ["greengrass:GetComponent"],
}));
//# sourceMappingURL=GetComponentHttp.js.map