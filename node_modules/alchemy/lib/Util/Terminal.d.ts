/** Terminal-emulator features shared by CliKit components. */
import { detectUnicodeSupport } from "@alchemy.run/sigil/capabilities";
import { type TerminalProgressState } from "@alchemy.run/sigil/ansi";
export declare const ANSI_RESET = "\u001B[0m";
export declare const ANSI_BOLD = "\u001B[1m";
export declare const ANSI_DIM = "\u001B[2m";
/** Truecolor foreground escape for raw, non-layout output. */
export declare const ansiFg: (hex: string) => string;
/**
 * The canonical color-support decision, shared by raw terminal strings and
 * CliKit capability detection so the two can never disagree.
 */
export declare const colorsEnabled: (stream?: Pick<NodeJS.WriteStream, "isTTY">) => boolean;
/** The canonical Unicode-support decision for raw terminal strings. */
export declare const unicodeEnabled: typeof detectUnicodeSupport;
/** Environment override for child processes whose piped output returns here. */
export declare const pipedColorEnv: () => Record<string, string>;
export declare const paint: (code: string, value: string) => string;
export declare const copyToClipboard: (text: string, stdout?: Pick<NodeJS.WriteStream, "write">) => void;
export declare const setNativeProgress: (state: TerminalProgressState, value?: number, stdout?: Pick<NodeJS.WriteStream, "write" | "isTTY">) => void;
/** Display-width-aware truncation (wide CJK/emoji count by rendered cells). */
export declare const truncate: (value: string, width: number) => string;
//# sourceMappingURL=Terminal.d.ts.map