import * as control from "@distilled.cloud/aws/bedrock-agentcore-control";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
export interface BrowserCustomProps {
    /**
     * Name of the browser. Must match `[a-zA-Z][a-zA-Z0-9_]{0,47}`
     * (underscores, no hyphens). If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Changing the name triggers
     * a replacement.
     */
    name?: string;
    /**
     * A description of the browser. Changing it triggers a replacement (the
     * API has no update operation).
     */
    description?: string;
    /**
     * The ARN of an IAM role browser sessions assume (required for session
     * recording to S3). Changing it triggers a replacement.
     */
    executionRoleArn?: string;
    /**
     * Network access for browser sessions: `PUBLIC` (internet egress) or
     * `VPC`. Changing it triggers a replacement.
     * @default { networkMode: "PUBLIC" }
     */
    networkConfiguration?: control.BrowserNetworkConfiguration;
    /**
     * Session recording configuration (S3 destination). Changing it triggers a
     * replacement.
     */
    recording?: control.RecordingConfig;
    /**
     * Tags to apply to the browser. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface BrowserCustom extends Resource<"AWS.BedrockAgentCore.BrowserCustom", BrowserCustomProps, {
    /**
     * The unique identifier of the browser.
     */
    browserId: string;
    /**
     * The ARN of the browser.
     */
    browserArn: string;
    /**
     * Name of the browser.
     */
    name: string;
    /**
     * Current status of the browser (e.g. `READY`).
     */
    status: string;
}> {
}
/**
 * A custom Amazon Bedrock AgentCore Browser — a managed, isolated cloud
 * browser that agents drive to interact with websites.
 *
 * A custom browser controls the sandbox's network mode, execution role, and
 * session recording. All configuration is create-only (the API has no update
 * operation); property changes trigger a replacement.
 *
 * ### Creating Browsers
 * **Example:** Public-Egress Browser
 * ```typescript
 * import * as AgentCore from "alchemy/AWS/BedrockAgentCore";
 *
 * const browser = yield* AgentCore.BrowserCustom("AgentBrowser", {});
 * ```
 *
 * **Example:** Browser with Session Recording
 * ```typescript
 * const browser = yield* AgentCore.BrowserCustom("RecordedBrowser", {
 *   executionRoleArn: role.roleArn,
 *   recording: {
 *     enabled: true,
 *     s3Location: { bucket: bucket.bucketName, prefix: "sessions/" },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const BrowserCustom: import("../../Resource.ts").ResourceClass<BrowserCustom>;
export declare const BrowserCustomProvider: () => import("effect/Layer").Layer<Provider.Provider<BrowserCustom>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=BrowserCustom.d.ts.map