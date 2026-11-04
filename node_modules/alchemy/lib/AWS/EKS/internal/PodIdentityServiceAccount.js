/**
 * Internal composite: a Kubernetes service account (bound onto the cluster)
 * wired to EKS Pod Identity through an IAM role + `PodIdentityAssociation`.
 * Un-exported — the workload platforms (`Kubernetes.Deployment`,
 * `Kubernetes.Job`) provision the same triple through the aws-eks
 * adapter; this helper remains for composition-style stacks that assemble
 * the pieces from resources.
 */
import * as Effect from "effect/Effect";
import * as Namespace from "../../../Namespace.js";
import { Role, } from "../../IAM/Role.js";
import { PodIdentityAssociation, } from "../PodIdentityAssociation.js";
import { clusterServiceAccount, namespaceNameOf, } from "./ClusterObject.js";
export const PodIdentityServiceAccount = (id, props) => Namespace.push(id, Effect.gen(function* () {
    const serviceAccountName = props.serviceAccountName ?? id;
    const role = props.roleArn
        ? undefined
        : yield* Role("Role", {
            roleName: props.roleName,
            assumeRolePolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: {
                            Service: "pods.eks.amazonaws.com",
                        },
                        Action: ["sts:AssumeRole", "sts:TagSession"],
                    },
                ],
            },
            description: props.description ??
                `Pod identity role for service account ${serviceAccountName}.`,
            managedPolicyArns: props.managedPolicyArns,
            inlinePolicies: props.inlinePolicies,
            tags: props.tags,
        });
    const serviceAccount = yield* clusterServiceAccount("ServiceAccount", {
        cluster: props.cluster,
        namespace: props.namespace,
        name: serviceAccountName,
        labels: props.labels,
        annotations: props.annotations,
    });
    const podIdentityAssociation = yield* PodIdentityAssociation("PodIdentityAssociation", {
        clusterName: props.cluster.clusterName,
        namespace: namespaceNameOf(props.namespace),
        serviceAccount: serviceAccount.name,
        roleArn: props.roleArn ?? role.roleArn,
        disableSessionTags: props.disableSessionTags,
        targetRoleArn: props.targetRoleArn,
        policy: props.policy,
        tags: props.tags,
    });
    return {
        serviceAccount,
        podIdentityAssociation,
        role,
        roleArn: props.roleArn ?? role.roleArn,
    };
}));
//# sourceMappingURL=PodIdentityServiceAccount.js.map