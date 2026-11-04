/**
 * Shared scaffolding for the Amazon S3 Control HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeS3Control…HttpBinding({ … }))` over one of the
 * builders below. Every S3 Control request carries the owning `AccountId`
 * (an endpoint host label), so each builder's only real job is deciding
 * where that account id comes from:
 *
 * - Access-point-scoped operations inject `AccountId` + `Name` from the
 *   bound {@link AccessPoint} and are granted on the access point ARN.
 * - Multi-Region Access Point operations inject `AccountId` + `Mrap` from
 *   the bound {@link MultiRegionAccessPoint}, are granted on the MRAP ARN,
 *   and are pinned to `us-west-2` (the region the MRAP control plane and
 *   route APIs are served from).
 * - Account-level operations (access point listing, S3 Batch Operations
 *   jobs) resolve the caller's account once via `sts:GetCallerIdentity`
 *   (cached per binding) and are granted on `*` — job ARNs are
 *   server-assigned at runtime and unknowable at deploy time.
 */
import { Region } from "@distilled.cloud/aws/Region";
import * as Effect from "effect/Effect";
import type { AccessPoint } from "./AccessPoint.ts";
import type { MultiRegionAccessPoint } from "./MultiRegionAccessPoint.ts";
/**
 * Build the impl Effect for an S3 Control operation scoped to an
 * {@link AccessPoint}: the deploy-time half grants `actions` on the bound
 * access point's ARN, and the runtime half injects the access point's
 * `AccountId` and `Name` into every request.
 */
export declare const makeS3ControlAccessPointHttpBinding: <I extends {
    AccountId: string;
    Name: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.S3Control.GetAccessPoint`. */
    tag: string;
    /** The distilled operation; `AccountId`/`Name` are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the access point ARN. */
    actions: readonly string[];
}) => Effect.Effect<(accessPoint: AccessPoint) => Effect.Effect<(request?: Omit<I, "AccountId" | "Name"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an S3 Control operation scoped to a
 * {@link MultiRegionAccessPoint}: the deploy-time half grants `actions` on
 * the bound MRAP's ARN, and the runtime half injects the MRAP's `AccountId`
 * and alias-addressed ARN (`Mrap`) into every request, pinned to the
 * `us-west-2` MRAP control-plane region.
 */
export declare const makeS3ControlMrapHttpBinding: <I extends {
    AccountId: string;
    Mrap: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.S3Control.GetMultiRegionAccessPointRoutes`. */
    tag: string;
    /** The distilled operation; `AccountId`/`Mrap` are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the Multi-Region Access Point ARN. */
    actions: readonly string[];
}) => Effect.Effect<(mrap: MultiRegionAccessPoint) => Effect.Effect<(request?: Omit<I, "AccountId" | "Mrap"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, Exclude<R, Region>>;
/**
 * Build the impl Effect for an account-level S3 Control operation (access
 * point listing, S3 Batch Operations jobs). The deploy-time half grants
 * `actions` on `*` — job ARNs are server-assigned at runtime and unknowable
 * at deploy time. The runtime half resolves the caller's account id once via
 * `sts:GetCallerIdentity` (needs no extra IAM permission) and injects it as
 * `AccountId`.
 */
export declare const makeS3ControlAccountHttpBinding: <I extends {
    AccountId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.S3Control.ListJobs`. */
    tag: string;
    /** The distilled operation; `AccountId` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
    /**
     * Grant `iam:PassRole` so the function can hand S3 Batch Operations the
     * execution role named in the job. Set on `CreateJob`. Matches the AWS
     * Batch Operations permission model (an `iam:PassedToService` condition is
     * NOT populated for `s3:CreateJob` — IAM denies a conditioned grant).
     */
    passRole?: boolean;
}) => Effect.Effect<() => Effect.Effect<(request?: Omit<I, "AccountId"> | undefined) => Effect.Effect<A, E | import("@distilled.cloud/aws/Errors").CommonErrors, never>, never, never>, never, R | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=BindingHttp.d.ts.map