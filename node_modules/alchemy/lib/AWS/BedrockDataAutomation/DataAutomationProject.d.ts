import * as bda from "@distilled.cloud/aws/bedrock-data-automation";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DataAutomationProjectProps {
    /**
     * Name of the project. Must match `[a-zA-Z0-9-_]+` and be at most 128
     * characters. Changing the name replaces the project.
     * @default ${app}-${stage}-${id}
     */
    projectName?: string;
    /**
     * Human-readable description of the project.
     */
    projectDescription?: string;
    /**
     * The stage of the project: `DEVELOPMENT` or `LIVE`. Stages are distinct
     * addressable copies, so changing the stage replaces the project.
     * @default LIVE
     */
    projectStage?: bda.DataAutomationProjectStage;
    /**
     * Whether the project processes files asynchronously (`ASYNC`) or
     * synchronously (`SYNC`). Immutable — changing it replaces the project.
     * @default ASYNC
     */
    projectType?: bda.DataAutomationProjectType;
    /**
     * The standard (default) output the project produces per modality —
     * document, image, video, and audio extraction settings. Pass `{}` to use
     * the service defaults.
     */
    standardOutputConfiguration: bda.StandardOutputConfiguration;
    /**
     * Custom output configuration — the list of `Blueprint`s the project
     * applies to matched files.
     */
    customOutputConfiguration?: bda.CustomOutputConfiguration;
    /**
     * Overrides for the project (e.g. document splitter and modality routing).
     */
    overrideConfiguration?: bda.OverrideConfiguration;
    /**
     * Data automation library (entity/vocabulary) configuration.
     */
    dataAutomationLibraryConfiguration?: bda.DataAutomationLibraryConfiguration;
    /**
     * Customer-managed KMS encryption for the project. When omitted, the
     * service uses an AWS-owned key.
     */
    encryptionConfiguration?: bda.EncryptionConfiguration;
    /**
     * Tags to apply to the project. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface DataAutomationProject extends Resource<"AWS.BedrockDataAutomation.DataAutomationProject", DataAutomationProjectProps, {
    /**
     * The ARN of the project.
     */
    projectArn: string;
    /**
     * Name of the project.
     */
    projectName: string;
    /**
     * The stage (`DEVELOPMENT` or `LIVE`) of the project.
     */
    projectStage: string;
    /**
     * Current status of the project (e.g. `COMPLETED`).
     */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon Bedrock Data Automation Project — the configuration unit that
 * turns documents, images, audio, and video into structured output, with
 * optional custom output driven by `Blueprint`s.
 *
 * ### Creating Projects
 * **Example:** Project with default standard output
 * ```typescript
 * import * as BDA from "alchemy/AWS/BedrockDataAutomation";
 *
 * const project = yield* BDA.DataAutomationProject("Docs", {
 *   standardOutputConfiguration: {},
 * });
 * ```
 *
 * **Example:** Document project with granular extraction
 * ```typescript
 * const project = yield* BDA.DataAutomationProject("Docs", {
 *   projectDescription: "invoice pipeline",
 *   standardOutputConfiguration: {
 *     document: {
 *       extraction: {
 *         granularity: { types: ["DOCUMENT", "PAGE"] },
 *         boundingBox: { state: "DISABLED" },
 *       },
 *       generativeField: { state: "DISABLED" },
 *       outputFormat: {
 *         textFormat: { types: ["MARKDOWN"] },
 *         additionalFileFormat: { state: "DISABLED" },
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * ### Custom Output
 * **Example:** Attach blueprints for custom output
 * ```typescript
 * const blueprint = yield* BDA.Blueprint("InvoiceBlueprint", {
 *   type: "DOCUMENT",
 *   schema: invoiceSchemaJson,
 * });
 *
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
export declare const DataAutomationProject: import("../../Resource.ts").ResourceClass<DataAutomationProject>;
declare const DataAutomationProjectFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DataAutomationProjectFailed";
} & Readonly<A>;
/**
 * Raised when a Data Automation project reaches the terminal `FAILED` status
 * during provisioning or update.
 */
export declare class DataAutomationProjectFailed extends DataAutomationProjectFailed_base<{
    projectArn: string;
    message: string;
}> {
}
export declare const DataAutomationProjectProvider: () => import("effect/Layer").Layer<Provider.Provider<DataAutomationProject>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=DataAutomationProject.d.ts.map