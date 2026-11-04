import * as Effect from "effect/Effect";
import { ProviderModePolicy } from "../../ProviderMode.js";
const SendEmailTypeId = "Cloudflare.Email.SendEmail";
export const isSendEmail = (value) => typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    value.kind === SendEmailTypeId;
export const SendEmail = Effect.fn(function* (id, props) {
    // Capture the `Alchemy.remote()` decoration the same way resources do —
    // at registration time, from the ambient ProviderModePolicy reference.
    // `send_email` has no cloud-side resource (and thus no provider mode to
    // stamp), so the captured flag rides on the descriptor instead.
    const devRemote = (yield* ProviderModePolicy) === true || undefined;
    return {
        kind: SendEmailTypeId,
        name: id,
        destinationAddress: props?.destinationAddress,
        allowedDestinationAddresses: props?.allowedDestinationAddresses,
        allowedSenderAddresses: props?.allowedSenderAddresses,
        devRemote,
    };
});
//# sourceMappingURL=SendEmail.js.map