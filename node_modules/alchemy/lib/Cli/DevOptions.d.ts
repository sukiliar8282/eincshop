import * as Schema from "effect/Schema";
/** Wire format passed from the `alchemy dev` supervisor to its exec child. */
export declare const DevOptions: Schema.Struct<{
    readonly main: Schema.String;
    readonly stage: Schema.String;
    readonly envFile: Schema.OptionFromOptional<Schema.String>;
    readonly profile: Schema.optional<Schema.String>;
    readonly force: Schema.Boolean;
}>;
export type DevOptions = typeof DevOptions.Type;
/**
 * Exit status the exec child uses to ask the supervisor for a fresh process.
 * Bun cannot evict evaluated modules, so a stack-graph change under Bun tears
 * the generation down and exits with this code instead of reloading in place.
 */
export declare const DEV_RELOAD_EXIT_CODE = 75;
//# sourceMappingURL=DevOptions.d.ts.map