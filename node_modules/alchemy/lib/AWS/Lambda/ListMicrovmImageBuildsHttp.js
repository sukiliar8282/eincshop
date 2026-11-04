import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { ListMicrovmImageBuilds } from "./ListMicrovmImageBuilds.js";
import { makeImageBinding } from "./MicrovmBinding.js";
export const ListMicrovmImageBuildsHttp = makeImageBinding({
    binding: ListMicrovmImageBuilds,
    name: "ListMicrovmImageBuilds",
    actions: ["lambda:ListMicrovmImageBuilds"],
    operation: microvms.listMicrovmImageBuilds,
    scope: "image",
    injectImageIdentifier: true,
});
//# sourceMappingURL=ListMicrovmImageBuildsHttp.js.map