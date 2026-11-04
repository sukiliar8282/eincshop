import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeArchiveHttpBinding } from "./BindingHttp.js";
import { ListArchiveExports } from "./ListArchiveExports.js";
export const ListArchiveExportsHttp = Layer.effect(ListArchiveExports, makeArchiveHttpBinding({
    tag: "AWS.MailManager.ListArchiveExports",
    operation: mm.listArchiveExports,
    actions: ["ses:ListArchiveExports"],
}));
//# sourceMappingURL=ListArchiveExportsHttp.js.map