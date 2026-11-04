/// <reference types="@cloudflare/workers-types" />
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import {} from "./LanguageModel.js";
export const QueryGateway = Binding.Service("Cloudflare.AI.QueryGateway");
// Error raised by AI Gateway runtime operations.
export class GatewayError extends Data.TaggedError("AiGatewayError") {
}
//# sourceMappingURL=QueryGateway.js.map