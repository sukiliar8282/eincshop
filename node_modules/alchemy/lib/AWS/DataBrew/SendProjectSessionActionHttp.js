import * as databrew from "@distilled.cloud/aws/databrew";
import * as Layer from "effect/Layer";
import { makeDataBrewProjectHttpBinding } from "./BindingHttp.js";
import { SendProjectSessionAction } from "./SendProjectSessionAction.js";
export const SendProjectSessionActionHttp = Layer.effect(SendProjectSessionAction, makeDataBrewProjectHttpBinding({
    tag: "AWS.DataBrew.SendProjectSessionAction",
    operation: databrew.sendProjectSessionAction,
    actions: ["databrew:SendProjectSessionAction"],
}));
//# sourceMappingURL=SendProjectSessionActionHttp.js.map