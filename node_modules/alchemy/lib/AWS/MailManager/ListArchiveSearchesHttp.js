import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeArchiveHttpBinding } from "./BindingHttp.js";
import { ListArchiveSearches } from "./ListArchiveSearches.js";
export const ListArchiveSearchesHttp = Layer.effect(ListArchiveSearches, makeArchiveHttpBinding({
    tag: "AWS.MailManager.ListArchiveSearches",
    operation: mm.listArchiveSearches,
    actions: ["ses:ListArchiveSearches"],
}));
//# sourceMappingURL=ListArchiveSearchesHttp.js.map