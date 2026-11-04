import * as qapps from "@distilled.cloud/aws/qapps";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type AppStatus = qapps.AppStatus;
export type AppRequiredCapability = qapps.AppRequiredCapability;
export type CardInput = qapps.CardInput;
/**
 * Definition of an Amazon Q App — the ordered cards that make up the app's
 * flow plus an optional initial prompt.
 */
export interface QAppDefinition {
    /**
     * The cards that make up the Q App. Card ids must be UUIDs; dependencies
     * between cards are calculated by the service from references in prompts
     * (e.g. `@card-title`).
     */
    cards: qapps.CardInput[];
    /**
     * The initial prompt displayed when the Q App is started.
     */
    initialPrompt?: string;
}
export interface QAppProps {
    /**
     * The unique identifier of the Amazon Q Business application environment
     * instance the Q App is created in. Changing it replaces the Q App.
     */
    instanceId: string;
    /**
     * Title of the Q App.
     * @default ${app}-${stage}-${id}
     */
    title?: string;
    /**
     * A description of the Q App.
     */
    description?: string;
    /**
     * The definition of the Q App — its cards and flow.
     */
    appDefinition: QAppDefinition;
    /**
     * Tags to associate with the Q App.
     */
    tags?: Record<string, string>;
}
export interface QApp extends Resource<"AWS.QApps.QApp", QAppProps, {
    /**
     * Service-assigned unique identifier of the Q App.
     */
    appId: string;
    /**
     * ARN of the Q App.
     */
    appArn: string;
    /**
     * The Q Business application environment instance the Q App belongs to.
     */
    instanceId: string;
    /**
     * The Q App's title.
     */
    title: string;
    /**
     * The Q App's description.
     */
    description: string | undefined;
    /**
     * The current version of the Q App definition.
     */
    appVersion: number;
    /**
     * Lifecycle status of the Q App (`DRAFT`, `PUBLISHED`, `DELETED`).
     */
    status: AppStatus;
    /**
     * Capabilities end users need to run the Q App (e.g. `FileUpload`).
     */
    requiredCapabilities: AppRequiredCapability[] | undefined;
    /**
     * Current tags reported for the Q App.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Q App — a lightweight, purpose-built AI app defined as a flow of
 * cards (text inputs, file uploads, LLM query cards, plugin cards) running
 * inside an Amazon Q Business application environment.
 *
 * :::caution
 * Q Apps live inside an Amazon Q Business application (pass its id as
 * `instanceId`), which itself requires IAM Identity Center. The calling
 * identity must be a user of that Q Business application.
 * :::
 * ### Creating Q Apps
 * **Example:** Prompt-Driven Q App
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const summarizer = yield* AWS.QApps.QApp("Summarizer", {
 *   instanceId: qbusinessApp.applicationId,
 *   description: "Summarizes pasted text",
 *   appDefinition: {
 *     cards: [
 *       {
 *         textInput: {
 *           id: "11111111-1111-4111-8111-111111111111",
 *           title: "Source Text",
 *           type: "text-input",
 *         },
 *       },
 *       {
 *         qQuery: {
 *           id: "22222222-2222-4222-8222-222222222222",
 *           title: "Summary",
 *           type: "q-query",
 *           prompt: "Summarize the following text: @Source Text",
 *         },
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * **Example:** File Upload Q App
 * ```typescript
 * const analyzer = yield* AWS.QApps.QApp("DocAnalyzer", {
 *   instanceId: qbusinessApp.applicationId,
 *   appDefinition: {
 *     initialPrompt: "Upload a document to analyze",
 *     cards: [
 *       {
 *         fileUpload: {
 *           id: "33333333-3333-4333-8333-333333333333",
 *           title: "Document",
 *           type: "file-upload",
 *         },
 *       },
 *       {
 *         qQuery: {
 *           id: "44444444-4444-4444-8444-444444444444",
 *           title: "Analysis",
 *           type: "q-query",
 *           prompt: "List the key points of @Document",
 *         },
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const QApp: import("../../Resource.ts").ResourceClass<QApp>;
export declare const QAppProvider: () => import("effect/Layer").Layer<Provider.Provider<QApp>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=QApp.d.ts.map