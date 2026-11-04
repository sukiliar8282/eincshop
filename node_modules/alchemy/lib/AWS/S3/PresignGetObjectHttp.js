import * as Presign from "@distilled.cloud/aws/Presign";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import * as Output from "../../Output.js";
import { isBindingHost } from "../Lambda/Function.js";
import { PresignGetObject, } from "./PresignGetObject.js";
export const PresignGetObjectHttp = Layer.effect(PresignGetObject, Effect.gen(function* () {
    const services = yield* Effect.context();
    return Effect.fn(function* (bucket) {
        const BucketName = yield* bucket.bucketName;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.S3.PresignGetObject(${bucket}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["s3:GetObject", "s3:GetObjectVersion"],
                            Resource: [Output.interpolate `${bucket.bucketArn}/*`],
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.S3.PresignGetObject(${bucket.LogicalId})`)(function* (request) {
            const bucketName = yield* BucketName;
            return yield* Presign.presignS3Url({
                method: "GET",
                bucket: bucketName,
                key: request.key,
                expiresIn: request.expiresIn,
                responseContentType: request.contentType,
            }).pipe(Effect.provideContext(services));
        });
    });
}));
//# sourceMappingURL=PresignGetObjectHttp.js.map