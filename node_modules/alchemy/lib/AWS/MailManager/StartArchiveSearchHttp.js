import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeArchiveHttpBinding } from "./BindingHttp.js";
import { StartArchiveSearch } from "./StartArchiveSearch.js";
export const StartArchiveSearchHttp = Layer.effect(StartArchiveSearch, makeArchiveHttpBinding({
    tag: "AWS.MailManager.StartArchiveSearch",
    operation: mm.startArchiveSearch,
    actions: ["ses:StartArchiveSearch"],
}));
//# sourceMappingURL=StartArchiveSearchHttp.js.map