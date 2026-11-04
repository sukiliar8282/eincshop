import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Logger from "effect/Logger";
import { Path } from "effect/Path";
import { AlchemyContext } from "../AlchemyContext.ts";
export declare const fileLogger: (...args: any[]) => Effect.Effect<Logger.Logger<unknown, void>, import("effect/PlatformError").PlatformError, AlchemyContext | FileSystem.FileSystem | Path | import("effect/Scope").Scope>;
//# sourceMappingURL=FileLogger.d.ts.map