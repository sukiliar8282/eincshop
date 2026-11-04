import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeArchiveTaskHttpBinding } from "./BindingHttp.js";
import { StopArchiveSearch } from "./StopArchiveSearch.js";
export const StopArchiveSearchHttp = Layer.effect(StopArchiveSearch, makeArchiveTaskHttpBinding({
    tag: "AWS.MailManager.StopArchiveSearch",
    operation: mm.stopArchiveSearch,
    actions: ["ses:StopArchiveSearch"],
}));
//# sourceMappingURL=StopArchiveSearchHttp.js.map