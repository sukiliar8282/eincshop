import * as organizations from "@distilled.cloud/aws/organizations";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type RootId = string;
export type RootArn = string;
export interface RootProps {
    /**
     * Optional root ID to import explicitly.
     * If omitted, Alchemy adopts the single organization root.
     */
    rootId?: string;
    /**
     * Optional root name to match when multiple roots are ever supported.
     */
    name?: string;
    /**
     * Optional tags to apply to the imported root.
     */
    tags?: Record<string, string>;
}
export interface Root extends Resource<"AWS.Organizations.Root", RootProps, {
    /**
     * ID of the root (e.g. `r-examplerootid`).
     */
    rootId: RootId;
    /**
     * ARN of the root.
     */
    rootArn: RootArn;
    /**
     * Friendly name of the root (usually `Root`).
     */
    rootName: string;
    /**
     * Policy types and their enablement status on this root.
     */
    policyTypes: organizations.PolicyTypeSummary[];
    /**
     * Tags on the root.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * The organization root.
 *
 * `Root` is an import-style resource. It discovers the existing root returned by
 * AWS Organizations and can reconcile root tags. Use `root.rootId` as the
 * `parentId` for top-level {@link OrganizationalUnit}s and {@link Account}s,
 * and as the `targetId`/`rootId` for {@link PolicyAttachment} and
 * {@link RootPolicyType}.
 * ### Importing the Root
 * **Example:** Adopt the Organization Root
 * ```typescript
 * const organization = yield* Organization("Org", { featureSet: "ALL" });
 * const root = yield* Root("Root", {});
 * ```
 *
 * **Example:** Parent OUs and Accounts Under the Root
 * ```typescript
 * const workloads = yield* OrganizationalUnit("Workloads", {
 *   parentId: root.rootId,
 *   name: "workloads",
 * });
 *
 * const sandbox = yield* Account("Sandbox", {
 *   name: "sandbox",
 *   email: "aws-sandbox@example.com",
 *   parentId: root.rootId,
 * });
 * ```
 *
 * @resource
 */
export declare const Root: import("../../Resource.ts").ResourceClass<Root>;
export declare const RootProvider: () => import("effect/Layer").Layer<Provider.Provider<Root>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Root.d.ts.map