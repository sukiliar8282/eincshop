import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ListProps {
    /**
     * Name of the list. If omitted, a unique lowercase name is generated from
     * the app, stage, and logical ID. Changing the name replaces the list.
     */
    name?: string;
    /**
     * Human-readable description. This is an in-place update.
     */
    description?: string;
    /**
     * The variable type of the list's elements (e.g. `IP_ADDRESS`,
     * `EMAIL_ADDRESS`). Fraud Detector only allows setting the variable type
     * once — changing an already-set variable type replaces the list.
     */
    variableType?: string;
    /**
     * The elements of the list. Reconcile converges the live list to exactly
     * this set (a `REPLACE` update); elements appended out-of-band (e.g. via the
     * `UpdateList` runtime binding) are removed on the next deploy unless they
     * are added here.
     *
     * @default []
     */
    elements?: string[];
    /**
     * User-defined tags for the list.
     */
    tags?: Record<string, string>;
}
export interface List extends Resource<"AWS.FraudDetector.List", ListProps, {
    /** The name of the list. */
    name: string;
    /** The ARN of the list. */
    arn: string;
}, never, Providers> {
}
/**
 * An Amazon Fraud Detector list — a set of input values for a variable (an
 * allow-list or deny-list, e.g. known-fraud IP addresses) referenced from
 * detector rule expressions.
 *
 * ### Creating a List
 * **Example:** Deny-list of IP Addresses
 * ```typescript
 * const blockedIps = yield* FraudDetector.List("BlockedIps", {
 *   variableType: "IP_ADDRESS",
 *   description: "known-fraud source addresses",
 *   elements: ["203.0.113.7", "198.51.100.9"],
 * });
 * ```
 *
 * ### Using a List at Runtime
 * **Example:** Append to the List from a Lambda
 * ```typescript
 * // init
 * const updateList = yield* FraudDetector.UpdateList(blockedIps);
 * const getListElements = yield* FraudDetector.GetListElements(blockedIps);
 *
 * // runtime
 * yield* updateList({ elements: ["192.0.2.44"], updateMode: "APPEND" });
 * const { elements } = yield* getListElements({});
 * // on the Function effect:
 * // .pipe(Effect.provide(Layer.mergeAll(
 * //   FraudDetector.UpdateListHttp,
 * //   FraudDetector.GetListElementsHttp,
 * // )))
 * ```
 *
 * @resource
 */
export declare const List: import("../../Resource.ts").ResourceClass<List>;
export declare const ListProvider: () => import("effect/Layer").Layer<Provider.Provider<List>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=List.d.ts.map