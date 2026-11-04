import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type RetrieverStatus = qbusiness.RetrieverStatus;
export type RetrieverType = qbusiness.RetrieverType;
export interface RetrieverProps {
    /**
     * The identifier of the Amazon Q Business application the retriever
     * attaches to. Changing it replaces the retriever.
     */
    applicationId: string;
    /**
     * The retriever type — `NATIVE_INDEX` (an Amazon Q Business index) or
     * `KENDRA_INDEX` (an existing Amazon Kendra index). Changing it replaces
     * the retriever.
     */
    type: RetrieverType;
    /**
     * Display name of the retriever.
     * @default ${app}-${stage}-${id}
     */
    displayName?: string;
    /**
     * The index the retriever queries — `nativeIndexConfiguration` for a
     * `NATIVE_INDEX` retriever, `kendraIndexConfiguration` for a
     * `KENDRA_INDEX` retriever.
     */
    configuration: qbusiness.RetrieverConfiguration;
    /**
     * ARN of the IAM role the retriever assumes (required for
     * `KENDRA_INDEX` retrievers to query the Kendra index).
     */
    roleArn?: string;
    /**
     * Tags to associate with the retriever.
     */
    tags?: Record<string, string>;
}
export interface Retriever extends Resource<"AWS.QBusiness.Retriever", RetrieverProps, {
    /**
     * Service-assigned unique identifier of the retriever (unique within
     * its application).
     */
    retrieverId: string;
    /**
     * The identifier of the application the retriever belongs to.
     */
    applicationId: string;
    /**
     * ARN of the retriever.
     */
    retrieverArn: string;
    /**
     * The retriever's display name.
     */
    displayName: string;
    /**
     * The retriever type.
     */
    type: RetrieverType | undefined;
    /**
     * Current lifecycle status of the retriever.
     */
    status: RetrieverStatus | undefined;
    /**
     * Current tags reported for the retriever.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Q Business retriever — the query engine that fetches relevant
 * passages from an index (native or Kendra) to ground chat responses.
 *
 * ### Creating Retrievers
 * **Example:** Native Index Retriever
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const retriever = yield* AWS.QBusiness.Retriever("Docs", {
 *   applicationId: app.applicationId,
 *   type: "NATIVE_INDEX",
 *   configuration: {
 *     nativeIndexConfiguration: { indexId: index.indexId },
 *   },
 * });
 * ```
 *
 * **Example:** Kendra Index Retriever
 * ```typescript
 * const retriever = yield* AWS.QBusiness.Retriever("Kendra", {
 *   applicationId: app.applicationId,
 *   type: "KENDRA_INDEX",
 *   roleArn: role.roleArn,
 *   configuration: {
 *     kendraIndexConfiguration: { indexId: kendraIndex.id },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Retriever: import("../../Resource.ts").ResourceClass<Retriever>;
declare const RetrieverProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "RetrieverProvisioningFailed";
} & Readonly<A>;
/**
 * A retriever whose asynchronous provisioning converged to the terminal
 * `FAILED` status.
 */
export declare class RetrieverProvisioningFailed extends RetrieverProvisioningFailed_base<{
    readonly retrieverId: string;
}> {
}
export declare const RetrieverProvider: () => import("effect/Layer").Layer<Provider.Provider<Retriever>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Retriever.d.ts.map