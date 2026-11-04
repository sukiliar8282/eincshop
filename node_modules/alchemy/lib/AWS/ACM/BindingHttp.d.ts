import type { Credentials } from "@distilled.cloud/aws/Credentials";
import { Region as AwsRegion } from "@distilled.cloud/aws/Region";
import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { Certificate } from "./Certificate.ts";
type AcmRequirements = Credentials | AwsRegion | HttpClient.HttpClient;
export interface AcmHttpBindingConfig<Req extends object, Out, Err> {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"DescribeCertificate"`.
     */
    capability: string;
    /**
     * IAM actions granted to the binding host, e.g. `["acm:GetCertificate"]`.
     */
    iamActions: readonly string[];
    /**
     * The distilled ACM operation implementing the capability.
     */
    operation: Effect.Effect<(input: Req & {
        CertificateArn: string;
    }) => Effect.Effect<Out, Err>, never, AcmRequirements>;
}
/**
 * Build the implementation effect for a certificate-scoped ACM capability:
 * `Layer.effect(Cap, makeAcmCertificateHttpBinding({ ... }))`.
 *
 * `Req` infers as the operation's *full* distilled request (inference against
 * `Req & { CertificateArn: string }` captures the whole source type). The
 * runtime callable injects the bound certificate's ARN, so its request type
 * is `Omit<Req, "CertificateArn">` — matching the capability contracts, which
 * declare `Omit<acm.XRequest, "CertificateArn">`.
 */
export declare const makeAcmCertificateHttpBinding: <Req extends object, Out, Err>(config: AcmHttpBindingConfig<Req, Out, Err>) => Effect.Effect<(certificate: Certificate) => Effect.Effect<(request?: Omit<Req, "CertificateArn"> | undefined) => Effect.Effect<Out, Err, never>, never, never>, never, Credentials | HttpClient.HttpClient>;
export interface AcmAccountHttpBindingConfig<Req extends object, Out, Err> {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"ListCertificates"`.
     */
    capability: string;
    /**
     * IAM actions granted to the binding host on `Resource: ["*"]` (ACM
     * account-level operations are not resource-scoped).
     */
    iamActions: readonly string[];
    /**
     * The distilled ACM operation implementing the capability.
     */
    operation: Effect.Effect<(input: Req) => Effect.Effect<Out, Err>, never, AcmRequirements>;
}
/**
 * Build the implementation effect for an account-level ACM capability (no
 * certificate argument): `Layer.effect(Cap, makeAcmAccountHttpBinding({ ... }))`.
 */
export declare const makeAcmAccountHttpBinding: <Req extends object, Out, Err>(config: AcmAccountHttpBindingConfig<Req, Out, Err>) => Effect.Effect<() => Effect.Effect<(request?: Req | undefined) => Effect.Effect<Out, Err, never>, never, never>, never, Credentials | HttpClient.HttpClient>;
export {};
//# sourceMappingURL=BindingHttp.d.ts.map