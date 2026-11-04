/**
 * Build the least-privilege IAM policy statement for a KMS crypto operation
 * against a {@link KeyLike} target.
 *
 * - `Key` resource → `Resource` is the exact key ARN.
 * - alias name → `Resource: "*"` constrained by the `kms:RequestAlias`
 *   condition, AWS's documented pattern for alias-scoped access. The runtime
 *   caller must (and does) address the key by that alias.
 *
 * @internal
 */
export const keyPolicyStatement = (action, key) => typeof key === "string"
    ? {
        Effect: "Allow",
        Action: typeof action === "string" ? [action] : [...action],
        Resource: ["*"],
        Condition: { StringEquals: { "kms:RequestAlias": key } },
    }
    : {
        Effect: "Allow",
        Action: typeof action === "string" ? [action] : [...action],
        Resource: [key.keyArn],
    };
/** Stable human-readable label for tracing spans. @internal */
export const keyLabel = (key) => typeof key === "string" ? key : key.LogicalId;
//# sourceMappingURL=KeyBinding.js.map