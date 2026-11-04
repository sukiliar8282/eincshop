import { stripVTControlCharacters } from "node:util";
import * as Effect from "effect/Effect";
import { makeLineBuffer } from "./LineBuffer.js";
import { ANSI_RESET, ansiFg, colorsEnabled } from "./Terminal.js";
import { theme } from "./Theme.js";
/** Sigil-themed resource attribution shared by every append-only log path. */
export const formatResourceTag = (id, colors = colorsEnabled()) => colors ? `${ansiFg(theme.color.info)}[${id}]${ANSI_RESET}` : `[${id}]`;
const EFFECT_LOG_PREFIX = /^\[\d{2}:\d{2}:\d{2}\.\d{3}\] (?:ALL|TRACE|DEBUG|INFO|WARN|ERROR|FATAL|NONE) \(#\d+\)(?: [^:]+)?: /;
/** Remove a pretty Effect prefix already rendered by a child process. */
export const stripChildEffectPrefix = (line) => {
    const match = stripVTControlCharacters(line).match(EFFECT_LOG_PREFIX);
    if (match === null)
        return line;
    // The match is measured against visible text. Walk the original line so
    // ANSI embedded in the child message survives while the prefix's ANSI is
    // discarded with the prefix itself.
    let visible = 0;
    let offset = 0;
    while (offset < line.length && visible < match[0].length) {
        if (line[offset] === "\x1b") {
            const ansi = line.slice(offset).match(/^\x1b\[[0-?]*[ -/]*[@-~]/);
            if (ansi !== null) {
                offset += ansi[0].length;
                continue;
            }
        }
        offset++;
        visible++;
    }
    return line.slice(offset);
};
/**
 * The single terminal-output pipeline for resource-owned processes. Dev
 * servers, local workers, and deploy-time builders all use the same line
 * splitting, resource prefix, color policy, and stdout/stderr severity.
 */
export const makeResourceOutput = (id, console) => {
    const prefix = formatResourceTag(id);
    // stderr is a process transport, not a semantic failure: Vite and many
    // other tools write warnings, progress, and ordinary diagnostics there.
    // Sending it through Console.error makes CLIKit prepend an error glyph to
    // every line. Both streams therefore enter the renderer as plain resource
    // output; the child text retains its own ANSI severity styling.
    const writeLine = (line) => console.log(`${prefix} ${stripChildEffectPrefix(line)}`);
    return {
        stdout: makeLineBuffer(writeLine),
        stderr: makeLineBuffer(writeLine),
    };
};
/**
 * Effect-native output for resource-owned child processes whose streams are
 * already consumed inside an Effect. Both process channels are transport
 * details, not semantic severity, so they enter the configured logger at the
 * info level. The logger remains responsible for terminal and file sinks.
 */
export const makeResourceLogger = (id) => {
    const prefix = formatResourceTag(id);
    return (_channel, line) => Effect.logInfo(`${prefix} ${stripChildEffectPrefix(line)}`);
};
//# sourceMappingURL=ResourceOutput.js.map