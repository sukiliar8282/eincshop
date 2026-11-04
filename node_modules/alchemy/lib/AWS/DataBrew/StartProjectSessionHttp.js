import * as databrew from "@distilled.cloud/aws/databrew";
import * as Layer from "effect/Layer";
import { makeDataBrewProjectHttpBinding } from "./BindingHttp.js";
import { StartProjectSession } from "./StartProjectSession.js";
export const StartProjectSessionHttp = Layer.effect(StartProjectSession, makeDataBrewProjectHttpBinding({
    tag: "AWS.DataBrew.StartProjectSession",
    operation: databrew.startProjectSession,
    actions: ["databrew:StartProjectSession"],
}));
//# sourceMappingURL=StartProjectSessionHttp.js.map