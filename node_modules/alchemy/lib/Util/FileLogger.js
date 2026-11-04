import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Logger from "effect/Logger";
import { Path } from "effect/Path";
import { AlchemyContext } from "../AlchemyContext.js";
export const fileLogger = Effect.fn(function* (...segments) {
    const { dotAlchemy } = yield* AlchemyContext;
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path;
    const logFile = path.join(dotAlchemy, "log", ...segments);
    yield* fs.makeDirectory(path.dirname(logFile), { recursive: true });
    return yield* Logger.formatLogFmt.pipe(Logger.toFile(logFile, {
        flag: "a",
    }));
});
//# sourceMappingURL=FileLogger.js.map