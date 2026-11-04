import * as machines from "@distilled.cloud/fly-io/machines";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { App } from "./App.ts";
import type { Providers } from "./Providers.ts";
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* App(...)` and `App(...)` both type-check).
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
export type CertificateKind = "acme" | "custom";
export type CertificateSource = "custom" | "fly";
export type CertificateDnsRequirements = {
    a?: string[];
    aaaa?: string[];
    acmeChallenge?: {
        name?: string;
        target?: string;
    };
    cname?: string;
    ownership?: {
        appValue?: string;
        name?: string;
        orgValue?: string;
    };
};
export type CertificateValidationState = {
    alpnConfigured?: boolean;
    dnsConfigured?: boolean;
    httpConfigured?: boolean;
    ownershipTxtConfigured?: boolean;
};
export interface CertificateProps {
    /**
     * Parent Fly App. Accepts a `Fly.App` resource or an Effect that
     * produces one. Changing the App replaces the Certificate.
     */
    app: Ref<App>;
    /**
     * Hostname this Certificate covers. Identity of the resource.
     * Changing it replaces the Certificate.
     */
    hostname: string;
    /**
     * How the Certificate is issued. `"acme"` requests a Let's Encrypt
     * certificate (`createAppAcmeCertificate`). `"custom"` uploads a PEM
     * (`createAppCustomCertificate`). Changing kind replaces.
     *
     * @default "acme"
     */
    kind?: CertificateKind;
    /**
     * PEM-encoded certificate chain. Required when `kind` is `"custom"`.
     * Updating it re-uploads in place (custom create upsert, or
     * delete+create if the API conflicts).
     */
    fullchain?: string;
    /**
     * PEM-encoded private key. Required when `kind` is `"custom"`. Wrap
     * with `Redacted.make` to keep it out of logs. Never stored in
     * attributes.
     */
    privateKey?: Redacted.Redacted<string> | string;
}
export type Certificate = Resource<"Fly.Certificate", CertificateProps, {
    /** Physical Fly App name the Certificate is attached to. */
    appName: string;
    /** Hostname this Certificate covers. Identity of the resource. */
    hostname: string;
    /** Observed status (`active`, `pending_validation`, …). */
    status: string | undefined;
    /** Whether DNS/ownership validation has completed. */
    configured: boolean | undefined;
    /** Whether ACME issuance has been requested for this hostname. */
    acmeRequested: boolean | undefined;
    /** DNS records Fly expects for validation. */
    dnsRequirements: CertificateDnsRequirements | undefined;
    /** Per-challenge validation flags. */
    validation: CertificateValidationState | undefined;
    /** Observed source: `"custom"` for uploaded PEMs, `"fly"` for ACME. */
    source: CertificateSource;
}, never, Providers>;
/**
 * A Fly.Certificate covers a hostname on an {@link App}. Default
 * `kind` is `"acme"` (Let's Encrypt). `"custom"` uploads a PEM.
 *
 * IPs and certificates attach to the App. A {@link Service} publishes
 * ports. Fly's proxy terminates TLS on 443 once the certificate is
 * `configured`.
 *
 * @see https://fly.io/docs/machines/api/certificates-resource/
 *
 * ### ACME certificates
 * Request Let's Encrypt for a hostname. The Service does not change.
 * Yield the certificate in the Stack. Point DNS at the App.
 *
 * **Example:** Let's Encrypt
 * ```typescript
 * export const Www = Fly.Certificate("Www", {
 *   app: Site,
 *   hostname: "www.example.com",
 * });
 * ```
 *
 * :::caution[Changing `hostname` replaces the Certificate]
 * Hostname is the identity. The old hostname is deleted, then the new
 * one is created.
 * :::
 *
 * :::caution[Changing `app` or `kind` replaces the Certificate]
 * The certificate is created on the new App or with the new issuer.
 * :::
 *
 * ### DNS
 * Point an A record at a `shared_v4` {@link IpAssignment} and an AAAA
 * at `v6`. Plus whatever `dnsRequirements` lists for the ACME
 * challenge. Alchemy re-checks via `checkAppCertificate` while
 * `configured` is false.
 *
 * Observed attrs include `status`, `configured`, `acmeRequested`,
 * `dnsRequirements`, and `validation`.
 *
 * **Example:** Yield next to a Service
 * ```typescript
 * export default Alchemy.Stack(
 *   "MyApp",
 *   { providers: Fly.providers(), state: Alchemy.localState() },
 *   Effect.gen(function* () {
 *     const api = yield* Api;
 *     const ip = yield* PublicIp;
 *     const v6 = yield* V6;
 *     const www = yield* Www;
 *     return {
 *       url: api.url,
 *       ip: ip.ip,
 *       v6: v6.ip,
 *       dns: www.dnsRequirements,
 *     };
 *   }),
 * );
 * ```
 *
 * ### Custom certificates
 * `"custom"` uploads `fullchain` and `privateKey`. Wrap the key with
 * `Redacted.make` so it never logs. Never stored in attributes.
 * Updating the PEM re-uploads in place.
 *
 * **Example:** Upload a PEM
 * ```typescript
 * export const Www = Fly.Certificate("Www", {
 *   app: Site,
 *   hostname: "www.example.com",
 *   kind: "custom",
 *   fullchain: pem,
 *   privateKey: Redacted.make(key),
 * });
 * ```
 *
 * @resource
 */
export declare const Certificate: import("../Resource.ts").ResourceClass<Certificate>;
declare const CertificateNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.CertificateNotCreated";
} & Readonly<A>;
export declare class CertificateNotCreated extends CertificateNotCreated_base<{
    appName: string;
    hostname: string;
}> {
}
declare const CertificateAppMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.CertificateAppMissing";
} & Readonly<A>;
export declare class CertificateAppMissing extends CertificateAppMissing_base<{
    hostname: string;
}> {
}
declare const CertificateMaterialRequired_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.CertificateMaterialRequired";
} & Readonly<A>;
export declare class CertificateMaterialRequired extends CertificateMaterialRequired_base<{
    hostname: string;
}> {
}
export declare const CertificateProvider: () => import("effect/Layer").Layer<Provider.Provider<Certificate>, never, machines.FlyIoOpContext>;
export {};
//# sourceMappingURL=Certificate.d.ts.map