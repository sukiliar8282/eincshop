/// <reference types="@cloudflare/workers-types" />
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.js";
export const Get = Binding.Service("Cloudflare.WorkersForPlatforms.Get");
/** Error raised by dynamic-dispatch runtime operations. */
export class DispatchNamespaceError extends Data.TaggedError("DispatchNamespaceError") {
}
//# sourceMappingURL=Get.js.map