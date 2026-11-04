import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/** How DataBrew samples the dataset in the interactive project view. */
export interface ProjectSample {
    /** Number of rows in the sample (default 500). */
    size?: number;
    /** Sampling strategy. */
    type: "FIRST_N" | "LAST_N" | "RANDOM" | (string & {});
}
export interface ProjectProps {
    /**
     * Name of the project. If omitted, a unique name is generated. Changing
     * the name replaces the project.
     * @default a generated physical name
     */
    projectName?: string;
    /**
     * The dataset the project explores. Changing it replaces the project.
     */
    datasetName: string;
    /**
     * The recipe the project edits (its `LATEST_WORKING` version). Changing
     * it replaces the project.
     */
    recipeName: string;
    /**
     * The sample shown in the interactive session.
     * @default 500 rows, FIRST_N
     */
    sample?: ProjectSample;
    /**
     * The IAM role ARN DataBrew assumes for the project's interactive
     * sessions (needs read access to the dataset's source).
     */
    role: string;
    /**
     * Tags to apply to the project. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Project extends Resource<"AWS.DataBrew.Project", ProjectProps, {
    /** Name of the project. */
    projectName: string;
    /** ARN of the project. */
    projectArn: string;
}, {}, Providers> {
}
/**
 * An AWS Glue DataBrew project — the interactive workspace binding a dataset
 * to a recipe's working version. The project definition is free; costs only
 * accrue when an interactive session is started in the console.
 * ### Creating Projects
 * **Example:** Dataset + Recipe Project
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const project = yield* AWS.DataBrew.Project("Explore", {
 *   datasetName: dataset.datasetName,
 *   recipeName: recipe.recipeName,
 *   role: role.roleArn,
 * });
 * ```
 *
 * **Example:** Custom Sample
 * ```typescript
 * const project = yield* AWS.DataBrew.Project("Explore", {
 *   datasetName: dataset.datasetName,
 *   recipeName: recipe.recipeName,
 *   sample: { type: "RANDOM", size: 250 },
 *   role: role.roleArn,
 * });
 * ```
 *
 * @resource
 */
export declare const Project: import("../../Resource.ts").ResourceClass<Project>;
export declare const ProjectProvider: () => import("effect/Layer").Layer<Provider.Provider<Project>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Project.d.ts.map