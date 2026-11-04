import * as contacts from "@distilled.cloud/aws/ssm-contacts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface RotationProps {
    /**
     * The name of the rotation. Changing it replaces the rotation.
     *
     * @default ${app}-${id}-${stage}-${suffix}
     */
    name?: string;
    /**
     * ARNs of the contacts on call, in shift order.
     */
    contactIds: string[];
    /**
     * When the rotation goes into effect, as an ISO-8601 timestamp
     * (e.g. `"2026-01-01T00:00:00Z"`).
     */
    startTime?: string;
    /**
     * The IANA time zone the rotation's activity is based on
     * (e.g. `"America/Los_Angeles"`).
     */
    timeZoneId: string;
    /**
     * How often the rotation hands off between contacts: daily, weekly, or
     * monthly hand-off settings plus the number of simultaneous on-calls and
     * optional shift coverage windows.
     */
    recurrence: contacts.RecurrenceSettings;
    /**
     * Tags applied to the rotation. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface Rotation extends Resource<"AWS.SSMContacts.Rotation", RotationProps, {
    /** ARN of the rotation. */
    rotationArn: string;
    /** Name of the rotation. */
    name: string;
    /** When the rotation goes into effect (ISO-8601). */
    startTime: string | undefined;
}, never, Providers> {
}
/**
 * An Incident Manager on-call rotation — a recurring schedule that rotates
 * engagement duty between contacts. Attach rotations to an
 * `ONCALL_SCHEDULE` contact via its engagement plan's `RotationIds`.
 *
 * ### Creating Rotations
 * **Example:** Daily hand-off rotation
 * ```typescript
 * const rotation = yield* SSMContacts.Rotation("Primary", {
 *   contactIds: [alice.contactArn, bob.contactArn],
 *   timeZoneId: "America/Los_Angeles",
 *   startTime: "2026-01-01T00:00:00Z",
 *   recurrence: {
 *     NumberOfOnCalls: 1,
 *     RecurrenceMultiplier: 1,
 *     DailySettings: [{ HourOfDay: 9, MinuteOfHour: 0 }],
 *   },
 * });
 * ```
 */
declare const RotationResource: import("../../Resource.ts").ResourceClass<Rotation>;
export { RotationResource as Rotation };
export declare const RotationProvider: () => import("effect/Layer").Layer<Provider.Provider<Rotation>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Rotation.d.ts.map