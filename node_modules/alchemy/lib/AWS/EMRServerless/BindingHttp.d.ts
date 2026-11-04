import * as Effect from "effect/Effect";
import type { Application } from "./Application.ts";
/**
 * Shared scaffolding for the Amazon EMR Serverless HTTP bindings.
 *
 * Every EMR Serverless data-plane operation is addressed by an
 * `applicationId`, so every binding is scoped to a bound {@link Application}:
 * the deploy-time half grants `actions` on the application's ARN (plus any
 * `subresources` wildcards — job runs and sessions are authorized against
 * `{applicationArn}/jobruns/*` / `{applicationArn}/sessions/*` sub-resource
 * ARNs), and the runtime half injects the application's id into every
 * request. Operations that hand the service an execution role to assume
 * (`StartJobRun`, `StartSession`) additionally grant `iam:PassRole`
 * conditioned to `emr-serverless.amazonaws.com`.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeEmrServerlessHttpBinding({ … }))`.
 */
export declare const makeEmrServerlessHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.EMRServerless.StartJobRun`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the application ARN (+ `subresources`). */
    actions: readonly string[];
    /**
     * Sub-resource wildcards additionally granted below the application ARN,
     * e.g. `"/jobruns/*"` for job-run-addressed actions.
     */
    subresources?: readonly string[];
    /**
     * Grant `iam:PassRole` (conditioned to `emr-serverless.amazonaws.com`) so
     * the function can hand the service the execution role a job run or
     * session assumes. Set on `StartJobRun` and `StartSession`.
     */
    passRole?: boolean;
}) => Effect.Effect<(application: Application) => Effect.Effect<(request?: Omit<I, "applicationId" | "clientToken"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map