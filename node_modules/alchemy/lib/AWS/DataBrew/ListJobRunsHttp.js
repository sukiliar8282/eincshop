import * as databrew from "@distilled.cloud/aws/databrew";
import * as Layer from "effect/Layer";
import { makeDataBrewJobHttpBinding } from "./BindingHttp.js";
import { ListJobRuns } from "./ListJobRuns.js";
export const ListJobRunsHttp = Layer.effect(ListJobRuns, makeDataBrewJobHttpBinding({
    tag: "AWS.DataBrew.ListJobRuns",
    operation: databrew.listJobRuns,
    actions: ["databrew:ListJobRuns"],
}));
//# sourceMappingURL=ListJobRunsHttp.js.map