import * as kms from "@distilled.cloud/aws/kms";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { isBindingHost } from "../Lambda/Function.js";
import { keyLabel, keyPolicyStatement } from "./KeyBinding.js";
import { ReEncrypt } from "./ReEncrypt.js";
/**
 * Bespoke (not scaffolded): ReEncrypt spans two keys — `kms:ReEncryptTo` on
 * the destination and `kms:ReEncryptFrom` on the source — and injects
 * `DestinationKeyId` (plus `SourceKeyId` when a source key is bound).
 */
export const ReEncryptHttp = Layer.effect(ReEncrypt, Effect.gen(function* () {
    const reEncrypt = yield* kms.reEncrypt;
    return Effect.fn(function* (destination, source) {
        const from = source ?? destination;
        const DestinationKeyId = typeof destination === "string"
            ? Effect.succeed(destination)
            : yield* destination.keyId;
        const SourceKeyId = typeof from === "string"
            ? Effect.succeed(from)
            : yield* from.keyId;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.KMS.ReEncrypt(${destination}, ${from}))`({
                    policyStatements: source === undefined
                        ? [
                            keyPolicyStatement(["kms:ReEncryptFrom", "kms:ReEncryptTo"], destination),
                        ]
                        : [
                            keyPolicyStatement("kms:ReEncryptTo", destination),
                            keyPolicyStatement("kms:ReEncryptFrom", from),
                        ],
                });
            }
        }
        return Effect.fn(`AWS.KMS.ReEncrypt(${keyLabel(destination)})`)(function* (request) {
            const destinationKeyId = yield* DestinationKeyId;
            // Always pin the source key (AWS best practice for symmetric
            // ciphertexts) — and required for alias-bound IAM, where the
            // `kms:RequestAlias` condition only matches when the alias appears
            // in the request.
            const sourceKeyId = yield* SourceKeyId;
            return yield* reEncrypt({
                ...request,
                SourceKeyId: sourceKeyId,
                DestinationKeyId: destinationKeyId,
            });
        });
    });
}));
//# sourceMappingURL=ReEncryptHttp.js.map