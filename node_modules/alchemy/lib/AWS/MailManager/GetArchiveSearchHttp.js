import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeArchiveTaskHttpBinding } from "./BindingHttp.js";
import { GetArchiveSearch } from "./GetArchiveSearch.js";
export const GetArchiveSearchHttp = Layer.effect(GetArchiveSearch, makeArchiveTaskHttpBinding({
    tag: "AWS.MailManager.GetArchiveSearch",
    operation: mm.getArchiveSearch,
    actions: ["ses:GetArchiveSearch"],
}));
//# sourceMappingURL=GetArchiveSearchHttp.js.map