import * as textract from "@distilled.cloud/aws/textract";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface AdapterProps {
    /**
     * Name of the adapter — 1-128 characters matching `[a-zA-Z0-9-_]+`. If
     * omitted, a unique name is generated. The name is updatable in place
     * (adapter identity is the server-assigned `adapterId`).
     */
    adapterName?: string;
    /**
     * Description of the adapter, updatable in place. Once set, the Textract
     * API cannot clear it back to empty — removing this prop leaves the last
     * description in place.
     */
    description?: string;
    /**
     * Feature types the adapter enhances. Textract currently supports only
     * `["QUERIES"]`. Changing this replaces the adapter.
     */
    featureTypes: textract.FeatureType[];
    /**
     * Whether Textract automatically retrains the adapter as the base model
     * improves (`ENABLED` or `DISABLED`).
     * @default "DISABLED"
     */
    autoUpdate?: textract.AutoUpdate;
    /**
     * Tags to apply to the adapter. Internal alchemy ownership tags are always
     * added.
     */
    tags?: Record<string, string>;
}
export interface Adapter extends Resource<"AWS.Textract.Adapter", AdapterProps, {
    /**
     * Server-assigned identifier of the adapter (its identity). Pass it in
     * `AdaptersConfig` to `AnalyzeDocument` / `StartDocumentAnalysis`.
     */
    adapterId: string;
    /**
     * ARN of the adapter. Textract uses a nonstandard resource path:
     * `arn:aws:textract:{region}:{account}:/adapters/{adapterId}`.
     */
    adapterArn: string;
    /**
     * Name of the adapter.
     */
    adapterName: string;
    /**
     * Feature types the adapter enhances (currently only `QUERIES`).
     */
    featureTypes: string[];
    /**
     * Whether the adapter auto-updates as the base model improves.
     */
    autoUpdate: string | undefined;
    /**
     * Creation time of the adapter as an ISO-8601 string.
     */
    creationTime: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon Textract adapter — a container for custom, trained adapter
 * versions that enhance the pre-trained Queries feature for your specific
 * documents. The adapter itself is cheap metadata (name, feature types,
 * auto-update, tags); versions are trained separately with
 * `CreateAdapterVersion` against an annotated dataset.
 *
 * ### Managing Adapters
 * **Example:** Create an adapter for the Queries feature
 * ```typescript
 * const adapter = yield* AWS.Textract.Adapter("InvoiceAdapter", {
 *   featureTypes: ["QUERIES"],
 *   description: "Tuned for invoice layouts",
 *   autoUpdate: "ENABLED",
 * });
 * ```
 *
 * **Example:** Analyze a document with a trained adapter version
 * ```typescript
 * const analyzeDocument = yield* AWS.Textract.AnalyzeDocument();
 * const result = yield* analyzeDocument({
 *   Document: { S3Object: { Bucket: bucketName, Name: "invoice.pdf" } },
 *   FeatureTypes: ["QUERIES"],
 *   QueriesConfig: { Queries: [{ Text: "What is the invoice total?" }] },
 *   AdaptersConfig: {
 *     Adapters: [{ AdapterId: adapter.adapterId, Version: "1" }],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Adapter: import("../../Resource.ts").ResourceClass<Adapter>;
export declare const AdapterProvider: () => import("effect/Layer").Layer<Provider.Provider<Adapter>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Adapter.d.ts.map