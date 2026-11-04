import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface WorkflowProps {
    /**
     * A name for the workflow. If omitted, a unique name is generated from the
     * app, stage, and logical ID. Mutable.
     */
    name?: string;
    /**
     * A description for the workflow. Mutable.
     */
    description?: string;
    /**
     * The workflow engine. Immutable — changing it replaces the workflow.
     * @default "WDL"
     */
    engine?: "WDL" | "NEXTFLOW" | "CWL";
    /**
     * The definition of the workflow, as a zip archive of the workflow source
     * files. Provided as raw bytes. Mutually exclusive with `definitionUri`.
     * Immutable — changing it replaces the workflow.
     */
    definitionZip?: Uint8Array;
    /**
     * The S3 URI of a zip archive containing the workflow definition. Mutually
     * exclusive with `definitionZip`. Immutable — changing it replaces the
     * workflow.
     */
    definitionUri?: string;
    /**
     * The path of the main definition file for the workflow within the zip
     * archive. Immutable.
     */
    main?: string;
    /**
     * A parameter template describing the workflow's input parameters.
     * Immutable.
     */
    parameterTemplate?: Record<string, {
        description?: string;
        optional?: boolean;
    }>;
    /**
     * The default static storage capacity (in gibibytes) for runs that use this
     * workflow. Mutable.
     */
    storageCapacity?: number;
    /**
     * The storage type for runs that use this workflow. Mutable.
     * @default "DYNAMIC"
     */
    storageType?: "STATIC" | "DYNAMIC";
    /**
     * The computational accelerators used by the workflow. Immutable.
     */
    accelerators?: "GPU";
    /**
     * Tags to apply to the workflow. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Workflow extends Resource<"AWS.Omics.Workflow", WorkflowProps, {
    /**
     * ID of the workflow.
     */
    workflowId: string;
    /**
     * ARN of the workflow.
     */
    workflowArn: string;
    /**
     * Name of the workflow.
     */
    name: string;
    /**
     * Workflow status (e.g. `ACTIVE`, `CREATING`, `UPDATING`, `FAILED`).
     */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon HealthOmics private workflow — a bioinformatics workflow (WDL,
 * Nextflow, or CWL) that is executed as one or more runs.
 *
 * A workflow name is auto-generated from the app, stage, and logical ID
 * unless you provide one. The workflow definition (`engine`, `definitionZip`,
 * `definitionUri`, `main`, `parameterTemplate`, `accelerators`) is immutable —
 * changing any of it replaces the workflow. `name`, `description`,
 * `storageCapacity`, and `storageType` are updated in place.
 * ### Creating a Workflow
 * **Example:** Workflow from an inline definition zip
 * ```typescript
 * import * as Omics from "alchemy/AWS/Omics";
 *
 * const workflow = yield* Omics.Workflow("Hello", {
 *   engine: "WDL",
 *   main: "main.wdl",
 *   definitionZip: myZipBytes,
 * });
 * ```
 *
 * **Example:** Workflow from an S3-hosted definition
 * ```typescript
 * const workflow = yield* Omics.Workflow("Hello", {
 *   engine: "NEXTFLOW",
 *   definitionUri: "s3://my-bucket/workflows/hello.zip",
 * });
 * ```
 *
 * @resource
 */
export declare const Workflow: import("../../Resource.ts").ResourceClass<Workflow>;
export declare const WorkflowProvider: () => import("effect/Layer").Layer<Provider.Provider<Workflow>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Workflow.d.ts.map