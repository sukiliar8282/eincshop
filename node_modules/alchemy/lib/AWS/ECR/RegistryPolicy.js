import * as ecr from "@distilled.cloud/aws/ecr";
import * as Effect from "effect/Effect";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { AWSEnvironment } from "../Environment.js";
import { normalizePolicyDocument, stringifyPolicyDocument, } from "../IAM/Policy.js";
/**
 * The permissions policy for a private Amazon ECR registry — an
 * account/region **singleton** used to grant other AWS accounts
 * registry-level permissions (most commonly `ecr:ReplicateImage` when
 * configuring cross-account replication).
 * ### Managing the Registry Policy
 * **Example:** Allow Cross-Account Replication
 * ```typescript
 * const policy = yield* RegistryPolicy("ReplicationPolicy", {
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Sid: "AllowReplication",
 *         Effect: "Allow",
 *         Principal: { AWS: `arn:aws:iam::${sourceAccountId}:root` },
 *         Action: ["ecr:ReplicateImage"],
 *         Resource: `arn:aws:ecr:us-east-1:${accountId}:repository/*`,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export const RegistryPolicy = Resource("AWS.ECR.RegistryPolicy");
export const RegistryPolicyProvider = () => Provider.effect(RegistryPolicy, Effect.gen(function* () {
    const readPolicy = ecr
        .getRegistryPolicy({})
        .pipe(Effect.catchTag("RegistryPolicyNotFoundException", () => Effect.succeed(undefined)));
    const toPolicyText = (policy) => typeof policy === "string" ? policy : stringifyPolicyDocument(policy);
    return {
        stables: ["registryId"],
        read: Effect.fn(function* () {
            const observed = yield* readPolicy;
            if (observed?.policyText === undefined)
                return undefined;
            return {
                registryId: observed.registryId ?? (yield* AWSEnvironment.current).accountId,
                policy: observed.policyText,
            };
        }),
        // The registry policy is an account/region singleton: at most one
        // exists, keyed on the caller's registry.
        list: () => Effect.gen(function* () {
            const observed = yield* readPolicy;
            if (observed?.policyText === undefined)
                return [];
            return [
                {
                    registryId: observed.registryId ??
                        (yield* AWSEnvironment.current).accountId,
                    policy: observed.policyText,
                },
            ];
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            const desired = toPolicyText(news.policy);
            // Observe — compare the live policy against the desired one via
            // `normalizePolicyDocument` (key order / whitespace insensitive)
            // so a re-deploy of an equivalent document is a no-op.
            const observed = yield* readPolicy;
            let registryId = observed?.registryId;
            if (observed?.policyText === undefined ||
                normalizePolicyDocument(observed.policyText) !==
                    normalizePolicyDocument(desired)) {
                const put = yield* ecr.putRegistryPolicy({ policyText: desired });
                registryId = put.registryId ?? registryId;
            }
            registryId ??= (yield* AWSEnvironment.current).accountId;
            yield* session.note(registryId);
            return { registryId, policy: desired };
        }),
        delete: Effect.fn(function* () {
            yield* ecr
                .deleteRegistryPolicy({})
                .pipe(Effect.catchTag("RegistryPolicyNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=RegistryPolicy.js.map