import * as kendra from "@distilled.cloud/aws/kendra";
import * as Layer from "effect/Layer";
import { makeKendraIndexHttpBinding } from "./BindingHttp.js";
import { Retrieve } from "./Retrieve.js";
export const RetrieveHttp = Layer.effect(Retrieve, makeKendraIndexHttpBinding({
    tag: "AWS.Kendra.Retrieve",
    operation: kendra.retrieve,
    actions: ["kendra:Retrieve"],
}));
//# sourceMappingURL=RetrieveHttp.js.map