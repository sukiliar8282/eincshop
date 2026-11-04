import * as emr from "@distilled.cloud/aws/emr-serverless";
import * as Effect from "effect/Effect";
declare const EmrServerlessStateTimeout_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "EmrServerlessStateTimeout";
} & Readonly<A>;
/**
 * Raised when an EMR Serverless application never settles into the expected
 * state within the bounded polling budget.
 */
export declare class EmrServerlessStateTimeout extends EmrServerlessStateTimeout_base<{
    readonly applicationId: string;
    readonly expected: readonly string[];
    readonly actual: string | undefined;
    readonly stateDetails: string | undefined;
}> {
}
/**
 * Await an application leaving `CREATING`, failing with
 * `EmrServerlessStateTimeout` if it does not settle into `CREATED` (or an
 * auto-started `STARTING`/`STARTED`) within the budget.
 */
export declare const awaitApplicationCreated: (applicationId: string) => Effect.Effect<emr.Application, EmrServerlessStateTimeout | emr.GetApplicationError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Await an application settling into an updatable/deletable state (`CREATED`
 * or `STOPPED`), draining `STARTING`/`STOPPING` transitions. The caller is
 * responsible for issuing `stopApplication` first when the application is
 * `STARTED`.
 */
export declare const awaitApplicationStopped: (applicationId: string) => Effect.Effect<emr.Application, EmrServerlessStateTimeout | emr.GetApplicationError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=internal.d.ts.map