import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Binding from "../../Binding.js";
export const ReadSecret = Binding.Service("Cloudflare.SecretsStore.ReadSecret");
export class SecretError extends Data.TaggedError("SecretError") {
}
//# sourceMappingURL=ReadSecret.js.map