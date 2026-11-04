import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.js";
export const Send = Binding.Service("Cloudflare.Email.SendEmail");
export class SendEmailError extends Data.TaggedError("SendEmailError") {
}
//# sourceMappingURL=Send.js.map