import * as bda from "@distilled.cloud/aws/bedrock-data-automation";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DataAutomationLibraryProps {
    /**
     * Name of the library. Changing the name replaces the library (the API has
     * no rename operation).
     * @default ${app}-${stage}-${id}
     */
    libraryName?: string;
    /**
     * Human-readable description of the library. Mutable in place.
     */
    libraryDescription?: string;
    /**
     * Customer-managed KMS encryption for the library. Create-only — changing
     * the key replaces the library. When omitted, the service uses an
     * AWS-owned key.
     */
    encryptionConfiguration?: bda.EncryptionConfiguration;
    /**
     * Tags to apply to the library. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface DataAutomationLibrary extends Resource<"AWS.BedrockDataAutomation.DataAutomationLibrary", DataAutomationLibraryProps, {
    /**
     * The ARN of the library.
     */
    libraryArn: string;
    /**
     * Name of the library.
     */
    libraryName: string;
    /**
     * Current status of the library (`ACTIVE` or `DELETING`).
     */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon Bedrock Data Automation Library — a store of reusable entities
 * (currently `VOCABULARY` entities: domain phrases with display forms) that
 * data automation projects reference via their
 * `dataAutomationLibraryConfiguration` to improve extraction accuracy.
 *
 * Entities are loaded into the library with ingestion jobs — see the
 * `InvokeDataAutomationLibraryIngestionJob` binding.
 *
 * ### Creating Libraries
 * **Example:** Library with a description
 * ```typescript
 * import * as BDA from "alchemy/AWS/BedrockDataAutomation";
 *
 * const library = yield* BDA.DataAutomationLibrary("Vocab", {
 *   libraryDescription: "domain vocabulary for invoice extraction",
 * });
 * ```
 *
 * **Example:** Reference the library from a project
 * ```typescript
 * const project = yield* BDA.DataAutomationProject("Docs", {
 *   standardOutputConfiguration: {},
 *   dataAutomationLibraryConfiguration: {
 *     libraries: [{ libraryArn: library.libraryArn }],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const DataAutomationLibrary: import("../../Resource.ts").ResourceClass<DataAutomationLibrary>;
declare const DataAutomationLibraryNotObservable_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DataAutomationLibraryNotObservable";
} & Readonly<A>;
/**
 * Raised when a Data Automation library cannot be observed immediately after
 * a successful create — a race with a concurrent delete.
 */
export declare class DataAutomationLibraryNotObservable extends DataAutomationLibraryNotObservable_base<{
    libraryName: string;
    message: string;
}> {
}
export declare const DataAutomationLibraryProvider: () => import("effect/Layer").Layer<Provider.Provider<DataAutomationLibrary>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=DataAutomationLibrary.d.ts.map