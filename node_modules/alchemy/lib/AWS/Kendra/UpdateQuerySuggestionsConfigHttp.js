import * as kendra from "@distilled.cloud/aws/kendra";
import * as Layer from "effect/Layer";
import { toWireDays } from "../../Util/Duration.js";
import { makeKendraIndexHttpBinding } from "./BindingHttp.js";
import { UpdateQuerySuggestionsConfig } from "./UpdateQuerySuggestionsConfig.js";
export const UpdateQuerySuggestionsConfigHttp = Layer.effect(UpdateQuerySuggestionsConfig, makeKendraIndexHttpBinding({
    tag: "AWS.Kendra.UpdateQuerySuggestionsConfig",
    operation: kendra.updateQuerySuggestionsConfig,
    actions: ["kendra:UpdateQuerySuggestionsConfig"],
    prepare: ({ queryLogLookBackWindow, ...rest } = {}) => ({
        ...rest,
        QueryLogLookBackWindowInDays: toWireDays(queryLogLookBackWindow),
    }),
}));
//# sourceMappingURL=UpdateQuerySuggestionsConfigHttp.js.map