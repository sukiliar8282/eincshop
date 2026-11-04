import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import { ListMicrovms } from "./ListMicrovms.js";
import { makeImageBinding } from "./MicrovmBinding.js";
export const ListMicrovmsHttp = makeImageBinding({
    binding: ListMicrovms,
    name: "ListMicrovms",
    actions: ["lambda:ListMicrovms"],
    operation: microvms.listMicrovms,
    scope: "account",
    injectImageIdentifier: true,
});
//# sourceMappingURL=ListMicrovmsHttp.js.map