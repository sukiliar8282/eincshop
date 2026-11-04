import * as bda from "@distilled.cloud/aws/bedrock-data-automation";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface BlueprintProps {
    /**
     * Name of the blueprint. Must match `[a-zA-Z0-9-_]+` and be at most 128
     * characters. Changing the name replaces the blueprint.
     * @default ${app}-${stage}-${id}
     */
    blueprintName?: string;
    /**
     * The modality the blueprint extracts custom output from: `DOCUMENT`,
     * `IMAGE`, `AUDIO`, or `VIDEO`. Changing the type replaces the blueprint.
     */
    type: bda.Type;
    /**
     * The JSON schema (as a string) describing the custom output fields the
     * blueprint extracts. See the Bedrock Data Automation blueprint schema
     * reference for the expected document shape.
     */
    schema: string;
    /**
     * The stage of the blueprint: `DEVELOPMENT` or `LIVE`. Stages are distinct
     * addressable copies, so changing the stage replaces the blueprint.
     * @default LIVE
     */
    blueprintStage?: bda.BlueprintStage;
    /**
     * Customer-managed KMS encryption for the blueprint. When omitted, the
     * service uses an AWS-owned key.
     */
    encryptionConfiguration?: bda.EncryptionConfiguration;
    /**
     * Tags to apply to the blueprint. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Blueprint extends Resource<"AWS.BedrockDataAutomation.Blueprint", BlueprintProps, {
    /**
     * The ARN of the blueprint.
     */
    blueprintArn: string;
    /**
     * Name of the blueprint.
     */
    blueprintName: string;
    /**
     * The stage (`DEVELOPMENT` or `LIVE`) of the blueprint.
     */
    blueprintStage: string;
    /**
     * The modality (`DOCUMENT`, `IMAGE`, `AUDIO`, or `VIDEO`) the blueprint
     * extracts custom output from.
     */
    type: string;
}, never, Providers> {
}
/**
 * An Amazon Bedrock Data Automation Blueprint — a JSON schema describing the
 * custom output fields to extract from documents, images, audio, or video.
 * Attach blueprints to a `DataAutomationProject` via its
 * `customOutputConfiguration`.
 *
 * ### Creating Blueprints
 * **Example:** Document blueprint with custom fields
 * ```typescript
 * import * as BDA from "alchemy/AWS/BedrockDataAutomation";
 *
 * const blueprint = yield* BDA.Blueprint("InvoiceBlueprint", {
 *   type: "DOCUMENT",
 *   schema: JSON.stringify({
 *     $schema: "http://json-schema.org/draft-07/schema#",
 *     description: "Extract invoice fields",
 *     class: "invoice",
 *     type: "object",
 *     properties: {
 *       invoice_number: {
 *         type: "string",
 *         inferenceType: "explicit",
 *         instruction: "The invoice number",
 *       },
 *     },
 *   }),
 * });
 * ```
 *
 * **Example:** Attach a blueprint to a project
 * ```typescript
 * const project = yield* BDA.DataAutomationProject("Docs", {
 *   standardOutputConfiguration: {},
 *   customOutputConfiguration: {
 *     blueprints: [{ blueprintArn: blueprint.blueprintArn }],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Blueprint: import("../../Resource.ts").ResourceClass<Blueprint>;
export declare const BlueprintProvider: () => import("effect/Layer").Layer<Provider.Provider<Blueprint>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Blueprint.d.ts.map