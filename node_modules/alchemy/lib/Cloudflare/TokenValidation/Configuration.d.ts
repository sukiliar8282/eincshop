import * as tokenValidation from "@distilled.cloud/cloudflare/token-validation";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.TokenValidation.Configuration";
type TypeId = typeof TypeId;
/**
 * A JSON Web Key (JWK) in a token configuration's key set. These are public
 * keys (the public half of a JWKS), not secrets.
 */
export type JwkKey = {
    /** Key type — RSA. */
    kty: "RSA";
    /** RSA signing algorithm the key is used with. */
    alg: "RS256" | "RS384" | "RS512" | "PS256" | "PS384" | "PS512";
    /** Key ID — must match the `kid` header of incoming JWTs. */
    kid: string;
    /** RSA modulus (base64url). */
    n: string;
    /** RSA public exponent (base64url). */
    e: string;
} | {
    /** Key type — elliptic curve. */
    kty: "EC";
    /** ECDSA P-256 signing algorithm. */
    alg: "ES256";
    /** Curve — P-256. */
    crv: "P-256";
    /** Key ID — must match the `kid` header of incoming JWTs. */
    kid: string;
    /** EC x coordinate (base64url). */
    x: string;
    /** EC y coordinate (base64url). */
    y: string;
} | {
    /** Key type — elliptic curve. */
    kty: "EC";
    /** ECDSA P-384 signing algorithm. */
    alg: "ES384";
    /** Curve — P-384. */
    crv: "P-384";
    /** Key ID — must match the `kid` header of incoming JWTs. */
    kid: string;
    /** EC x coordinate (base64url). */
    x: string;
    /** EC y coordinate (base64url). */
    y: string;
};
export interface TokenConfigurationProps {
    /**
     * Zone the token configuration belongs to.
     *
     * Stable — moving a configuration between zones triggers a replacement.
     */
    zoneId: string;
    /**
     * Human-readable name for the configuration. If omitted, a unique name is
     * generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    title?: string;
    /**
     * A description that gives more details than `title`.
     * @default ""
     */
    description?: string;
    /**
     * Where to look for the token on incoming requests, as firewall fields —
     * e.g. `http.request.headers["authorization"][0]`.
     */
    tokenSources: string[];
    /**
     * The JWKS key set used to validate token signatures. Replacing entries
     * rotates the key set in place via the credentials endpoint.
     */
    keys: JwkKey[];
    /**
     * The token format. Only JWT is supported today. Cannot be changed after
     * creation — updating this property triggers a replacement.
     * @default "JWT"
     */
    tokenType?: "JWT";
}
export interface TokenConfigurationAttributes {
    /** Cloudflare-assigned UUID of the token configuration. */
    configId: string;
    /** Zone the configuration belongs to. */
    zoneId: string;
    /** Human-readable name of the configuration. */
    title: string;
    /** Description of the configuration. */
    description: string;
    /** Where the token is looked for on incoming requests. */
    tokenSources: string[];
    /** The token format. */
    tokenType: "JWT" | (string & {});
    /** The JWKS key set currently active on the configuration. */
    keys: JwkKey[];
    /** ISO8601 creation timestamp. */
    createdAt: string;
    /** ISO8601 last-modified timestamp. */
    lastUpdated: string;
}
export type TokenConfiguration = Resource<TypeId, TokenConfigurationProps, TokenConfigurationAttributes, never, Providers>;
/**
 * An API Shield JWT validation token configuration — the JWKS key material
 * and token source locations used to validate JSON Web Tokens on a zone.
 *
 * A configuration holds a set of public JWKs (`keys`) plus the request
 * fields where the token is found (`tokenSources`). Rules
 * ({@link Rule}) then reference the configuration by UUID in
 * their expression (e.g. `is_jwt_valid("<configId>")`) to enforce
 * validation on selected hosts/operations.
 *
 * JWT validation is an API Shield feature (Enterprise add-on) — accounts
 * without the entitlement receive the typed `TokenValidationNotEntitled`
 * error (Cloudflare code 10403) on every call.
 *
 * Title, description, and token sources are patched in place; the key set
 * is rotated in place via the credentials endpoint. Only `zoneId` and
 * `tokenType` force a replacement.
 * ### Creating a Configuration
 * **Example:** JWT configuration with an RSA key
 * ```typescript
 * const config = yield* Cloudflare.TokenValidation.TokenConfiguration("ApiJwt", {
 *   zoneId: zone.zoneId,
 *   tokenSources: ['http.request.headers["authorization"][0]'],
 *   keys: [
 *     {
 *       kty: "RSA",
 *       alg: "RS256",
 *       kid: "key-2026-01",
 *       n: "<base64url modulus>",
 *       e: "AQAB",
 *     },
 *   ],
 * });
 * ```
 *
 * ### Rotating Keys
 * **Example:** Replace the key set in place
 * ```typescript
 * // Changing `keys` PUTs the full key set to the credentials endpoint —
 * // the configuration (and its UUID) stays in place.
 * const config = yield* Cloudflare.TokenValidation.TokenConfiguration("ApiJwt", {
 *   zoneId: zone.zoneId,
 *   tokenSources: ['http.request.headers["authorization"][0]'],
 *   keys: [oldKey, newKey],
 * });
 * ```
 *
 * ### Enforcing Validation
 * **Example:** Reference the configuration from a rule
 * ```typescript
 * yield* Cloudflare.TokenValidation.Rule("RequireJwt", {
 *   zoneId: zone.zoneId,
 *   action: "block",
 *   expression: Output.interpolate`is_jwt_valid("${config.configId}")`,
 *   selector: { include: [{ host: ["api.example.com"] }] },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api-shield/security/jwt-validation/
 *
 * @resource
 * @product Token Validation
 * @category Application Security
 */
export declare const TokenConfiguration: import("../../Resource.ts").ResourceClass<TokenConfiguration>;
/**
 * Returns true if the given value is a TokenConfiguration resource.
 */
export declare const isTokenConfiguration: (value: unknown) => value is TokenConfiguration;
export declare const TokenConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<TokenConfiguration>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | tokenValidation.CloudflareOpContext>;
export {};
//# sourceMappingURL=Configuration.d.ts.map