import * as kendra from "@distilled.cloud/aws/kendra";
import * as Layer from "effect/Layer";
import { makeKendraIndexHttpBinding } from "./BindingHttp.js";
import { DescribeQuerySuggestionsConfig } from "./DescribeQuerySuggestionsConfig.js";
export const DescribeQuerySuggestionsConfigHttp = Layer.effect(DescribeQuerySuggestionsConfig, makeKendraIndexHttpBinding({
    tag: "AWS.Kendra.DescribeQuerySuggestionsConfig",
    operation: kendra.describeQuerySuggestionsConfig,
    actions: ["kendra:DescribeQuerySuggestionsConfig"],
}));
//# sourceMappingURL=DescribeQuerySuggestionsConfigHttp.js.map