import * as Stream from "effect/Stream";
import { BadArgument, SystemError } from "effect/PlatformError";
import type { CommandProps } from "./Command.ts";
export interface CommandRedactor {
    readonly redact: (value: string) => string;
    readonly stream: <E, R>(stream: Stream.Stream<string, E, R>) => Stream.Stream<string, E, R>;
}
export declare const makeCommandRedactor: (env: CommandProps["env"]) => CommandRedactor;
export declare const redactPlatformReason: (reason: BadArgument | SystemError, redactor: CommandRedactor) => BadArgument | SystemError;
//# sourceMappingURL=Redaction.d.ts.map