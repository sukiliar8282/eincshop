import { Credentials } from "@distilled.cloud/neon";
import * as Layer from "effect/Layer";
export { Credentials } from "@distilled.cloud/neon";
export declare const fromAuthProvider: () => Layer.Layer<Credentials, import("../Auth/AuthProvider.ts").AuthError | import("effect/Config").ConfigError | import("../Auth/Profile.ts").MissingProviderConfig | import("effect/PlatformError").PlatformError | import("../Auth/Profile.ts").ProfileError, import("../index.ts").AuthProviders | import("../Auth/Profile.ts").ProfileStore>;
//# sourceMappingURL=Credentials.d.ts.map