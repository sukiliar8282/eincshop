import * as vpclattice from "@distilled.cloud/aws/vpc-lattice";
import * as Effect from "effect/Effect";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { normalizePolicyDocument, stringifyPolicyDocument, } from "../IAM/Policy.js";
/**
 * A resource-based permission policy on a VPC Lattice service or service
 * network — the policy AWS RAM manages when sharing Lattice resources across
 * accounts, attachable directly for fine-grained cross-account control.
 *
 * ### Attaching Resource Policies
 * **Example:** Allow Another Account to Associate with a Service Network
 * ```typescript
 * const network = yield* ServiceNetwork("SharedNetwork", {});
 * const policy = yield* ResourcePolicy("SharePolicy", {
 *   resourceArn: network.serviceNetworkArn,
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: "arn:aws:iam::123456789012:root" },
 *         Action: [
 *           "vpc-lattice:CreateServiceNetworkVpcAssociation",
 *           "vpc-lattice:CreateServiceNetworkServiceAssociation",
 *           "vpc-lattice:GetServiceNetwork",
 *         ],
 *         Resource: network.serviceNetworkArn,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export const ResourcePolicy = Resource("AWS.VpcLattice.ResourcePolicy");
export const ResourcePolicyProvider = () => Provider.effect(ResourcePolicy, Effect.gen(function* () {
    // A missing parent and a parent without a policy are both "no policy" —
    // getResourcePolicy answers with an empty body for the latter, so treat
    // an absent `policy` as non-existence.
    const observe = (resourceArn) => vpclattice.getResourcePolicy({ resourceArn }).pipe(Effect.map((response) => response.policy), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const toDesired = (policy) => typeof policy === "string" ? policy : stringifyPolicyDocument(policy);
    return {
        stables: ["resourceArn"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return;
            if (olds && olds.resourceArn !== news.resourceArn) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const resourceArn = output?.resourceArn ?? olds?.resourceArn;
            if (!resourceArn)
                return undefined;
            const observed = yield* observe(resourceArn);
            if (observed === undefined)
                return undefined;
            return { resourceArn, policy: observed };
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            const resourceArn = news.resourceArn;
            const desired = toDesired(news.policy);
            // Observe — putResourcePolicy is an upsert. Compare the
            // canonicalized live document against the canonicalized desired one
            // so a re-deploy of an equivalent policy (key order, whitespace)
            // skips the API call entirely.
            const observed = yield* observe(resourceArn);
            if (observed === undefined ||
                normalizePolicyDocument(observed) !==
                    normalizePolicyDocument(desired)) {
                yield* vpclattice.putResourcePolicy({
                    resourceArn,
                    policy: desired,
                });
            }
            yield* session.note(resourceArn);
            return { resourceArn, policy: desired };
        }),
        // Resource policies are sub-resources keyed entirely by their parent
        // service network / service ARN — there is no enumeration API.
        list: () => Effect.succeed([]),
        delete: Effect.fn(function* ({ output }) {
            yield* vpclattice
                .deleteResourcePolicy({ resourceArn: output.resourceArn })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=ResourcePolicy.js.map