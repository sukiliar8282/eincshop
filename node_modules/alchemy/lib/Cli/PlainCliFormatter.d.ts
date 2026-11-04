import * as CliOutput from "effect/unstable/cli/CliOutput";
/**
 * Help formatter for plain (non-interactive) runs: the default effect/cli
 * formatter with colors off, enum flag types compacted, and output wrapped
 * to the terminal width — CI logs, redirected output, and coding agents
 * get parseable, bounded lines.
 */
export declare const plainCliFormatter: (options: {
    columns: number;
}) => CliOutput.Formatter;
//# sourceMappingURL=PlainCliFormatter.d.ts.map