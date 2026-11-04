/**
 * Resolve the IAM policy `Resource` ARNs required to invoke a Bedrock model.
 *
 * Accepts any of the model reference forms `Converse`/`InvokeModel` accept:
 *
 * - a foundation-model id (`anthropic.claude-sonnet-4-20250514-v1:0`) —
 *   resolves to `arn:aws:bedrock:{region}::foundation-model/{modelId}`
 * - a cross-region inference profile id (`us.amazon.nova-micro-v1:0`) —
 *   resolves to the account's inference-profile ARN *plus* the underlying
 *   foundation-model ARN in every region the profile can route to
 *   (`arn:aws:bedrock:*::foundation-model/{baseModelId}`), which Bedrock
 *   requires for cross-region invocation
 * - a full ARN (foundation model, inference profile, application inference
 *   profile, imported/custom model, or prompt ARN) — passed through as-is
 */
export declare const bedrockModelArns: (region: string, accountId: string, modelId: string) => string[];
//# sourceMappingURL=ModelArns.d.ts.map