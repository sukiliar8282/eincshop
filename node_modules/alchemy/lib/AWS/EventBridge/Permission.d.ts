import * as eventbridge from "@distilled.cloud/aws/eventbridge";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PermissionProps {
    /**
     * Event bus name. Defaults to the account default bus.
     */
    eventBusName?: string;
    /**
     * The action that EventBridge allows for the principal.
     * @default "events:PutEvents"
     */
    action?: string;
    /**
     * The AWS account ID, organization ID, or `*` principal receiving access.
     */
    principal: string;
    /**
     * Optional statement identifier. If omitted, Alchemy generates one.
     */
    statementId?: string;
    /**
     * Optional condition limiting the allowed caller.
     */
    condition?: eventbridge.Condition;
}
/**
 * An EventBridge event bus permission statement.
 *
 * `Permission` manages a single `PutPermission` / `RemovePermission` lifecycle
 * entry on an event bus so helper surfaces can safely grant publishers access
 * without requiring callers to hand-write raw bus policies.
 * ### Granting Access
 * **Example:** Allow Another Account To Publish
 * ```typescript
 * const permission = yield* Permission("PartnerPublish", {
 *   eventBusName: bus.eventBusName,
 *   principal: "123456789012",
 * });
 * ```
 *
 * @resource
 */
export interface Permission extends Resource<"AWS.EventBridge.Permission", PermissionProps, {
    /** The statement ID identifying the permission on the bus policy. */
    statementId: string;
    /** The name of the event bus the permission is attached to. */
    eventBusName: string;
}, never, Providers> {
}
export declare const Permission: import("../../Resource.ts").ResourceClass<Permission>;
export declare const PermissionProvider: () => import("effect/Layer").Layer<Provider.Provider<Permission>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Permission.d.ts.map