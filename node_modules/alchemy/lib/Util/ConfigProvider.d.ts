import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Option from "effect/Option";
export declare const loadConfigProvider: (envFile: Option.Option<string>) => Effect.Effect<ConfigProvider.ConfigProvider, import("effect/PlatformError").PlatformError, FileSystem.FileSystem>;
//# sourceMappingURL=ConfigProvider.d.ts.map