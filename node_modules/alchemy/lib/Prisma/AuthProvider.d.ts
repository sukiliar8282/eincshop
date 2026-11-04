import * as Redacted from "effect/Redacted";
import { type StoredAuthConfig } from "../Auth/StoredAuthProvider.ts";
export declare const PRISMA_AUTH_PROVIDER_NAME = "Prisma";
export type PrismaAuthConfig = StoredAuthConfig;
export interface PrismaResolvedCredentials {
    type: "serviceToken";
    serviceToken: Redacted.Redacted<string>;
    source: {
        type: PrismaAuthConfig["method"] | "env";
        details?: string;
    };
}
/**
 * Layer that registers the Prisma Management API auth provider.
 */
export declare const PrismaAuth: import("effect/Layer").Layer<never, never, import("../index.ts").AuthProviders | import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
/** Schema of Prisma's inline static-token values. */
export declare const PrismaStoredCredentials: import("effect/Schema").Codec<import("../Auth/StoredAuthProvider.ts").StoredValues, import("../Auth/StoredAuthProvider.ts").StoredValues, never, never>;
export type PrismaStoredCredentials = typeof PrismaStoredCredentials.Type;
//# sourceMappingURL=AuthProvider.d.ts.map