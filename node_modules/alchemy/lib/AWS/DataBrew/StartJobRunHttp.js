import * as databrew from "@distilled.cloud/aws/databrew";
import * as Layer from "effect/Layer";
import { makeDataBrewJobHttpBinding } from "./BindingHttp.js";
import { StartJobRun } from "./StartJobRun.js";
export const StartJobRunHttp = Layer.effect(StartJobRun, makeDataBrewJobHttpBinding({
    tag: "AWS.DataBrew.StartJobRun",
    operation: databrew.startJobRun,
    actions: ["databrew:StartJobRun"],
}));
//# sourceMappingURL=StartJobRunHttp.js.map