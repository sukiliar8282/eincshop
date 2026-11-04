import * as Presign from "@distilled.cloud/aws/Presign";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import * as Output from "../../Output.js";
import { isBindingHost } from "../Lambda/Function.js";
import { PresignPutObject, } from "./PresignPutObject.js";
export const PresignPutObjectHttp = Layer.effect(PresignPutObject, Effect.gen(function* () {
    const services = yield* Effect.context();
    return Effect.fn(function* (bucket) {
        const BucketName = yield* bucket.bucketName;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.S3.PresignPutObject(${bucket}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["s3:PutObject"],
                            Resource: [Output.interpolate `${bucket.bucketArn}/*`],
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.S3.PresignPutObject(${bucket.LogicalId})`)(function* (request) {
            const bucketName = yield* BucketName;
            return yield* Presign.presignS3Url({
                method: "PUT",
                bucket: bucketName,
                key: request.key,
                expiresIn: request.expiresIn,
                contentType: request.contentType,
            }).pipe(Effect.provideContext(services));
        });
    });
}));
//# sourceMappingURL=PresignPutObjectHttp.js.map