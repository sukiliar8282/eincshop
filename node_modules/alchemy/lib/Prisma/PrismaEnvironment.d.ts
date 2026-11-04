import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import { type PrismaResolvedCredentials } from "./AuthProvider.ts";
export interface PrismaEnvironmentShape extends PrismaResolvedCredentials {
    baseUrl: string;
}
declare const PrismaEnvironment_base: Context.ServiceClass<PrismaEnvironment, "Prisma::PrismaEnvironment", PrismaEnvironmentShape>;
export declare class PrismaEnvironment extends PrismaEnvironment_base {
}
export declare const fromProfile: () => Layer.Layer<PrismaEnvironment, Config.ConfigError | Error | import("effect/PlatformError").PlatformError, import("../index.ts").AuthProviders | import("../Auth/Profile.ts").ProfileStore>;
export {};
//# sourceMappingURL=PrismaEnvironment.d.ts.map