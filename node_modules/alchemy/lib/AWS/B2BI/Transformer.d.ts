import * as b2bi from "@distilled.cloud/aws/b2bi";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface TransformerProps {
    /**
     * The name of the transformer.
     */
    name: string;
    /**
     * The transformer's processing state. Newly created transformers default
     * to `inactive`; set to `active` to make the transformer usable by a
     * capability. Activation is one-way: an active transformer rejects every
     * update (including deactivation), so changing the configuration, name, or
     * status of an active transformer replaces it.
     * @default "inactive"
     */
    status?: "active" | "inactive";
    /**
     * Describes the format of the source document (e.g. X12 EDI) and any
     * advanced options for parsing it.
     */
    inputConversion?: b2bi.InputConversion;
    /**
     * The mapping template (JSONATA or XSLT) that transforms the input
     * document into the output format.
     */
    mapping?: b2bi.Mapping;
    /**
     * Describes the format of the output document (e.g. X12 EDI) for outbound
     * transformers.
     */
    outputConversion?: b2bi.OutputConversion;
    /**
     * Locations of sample input and output documents used to test the
     * transformer.
     */
    sampleDocuments?: b2bi.SampleDocuments;
    /**
     * User-defined tags for the transformer.
     */
    tags?: Record<string, string>;
}
export interface Transformer extends Resource<"AWS.B2BI.Transformer", TransformerProps, {
    /**
     * Service-assigned unique ID of the transformer.
     */
    transformerId: string;
    /**
     * ARN of the transformer.
     */
    transformerArn: string;
    /**
     * Name of the transformer.
     */
    name: string;
    /**
     * Current status (`active` or `inactive`).
     */
    status: string;
}, never, Providers> {
}
/**
 * An AWS B2B Data Interchange (B2BI) transformer. A transformer describes
 * how to convert inbound EDI documents to a target format (or the reverse)
 * using a mapping template. Transformers are credential-free and testable.
 *
 * Activation is one-way: B2BI rejects every update to an `active`
 * transformer, including a status-only deactivation, so changing the
 * configuration, name, or status of an active transformer replaces it
 * (delete-first). Deletion works regardless of status.
 * ### Creating a Transformer
 * **Example:** Inbound X12 to JSON
 * ```typescript
 * const transformer = yield* B2BI.Transformer("X12ToJson", {
 *   name: "x12-to-json",
 *   status: "active",
 *   inputConversion: {
 *     fromFormat: "X12",
 *     formatOptions: { x12: { transactionSet: "X12_850", version: "VERSION_4010" } },
 *   },
 *   mapping: {
 *     templateLanguage: "JSONATA",
 *     template: "{ \"orderId\": transactionSets[0].St.transactionSetControlNumber }",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Transformer: import("../../Resource.ts").ResourceClass<Transformer>;
export declare const TransformerProvider: () => import("effect/Layer").Layer<Provider.Provider<Transformer>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Transformer.d.ts.map