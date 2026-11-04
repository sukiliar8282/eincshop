import * as Command from "effect/unstable/cli/Command";
export declare const compatibilityCommands: {
    readonly login: "alchemy profile";
    readonly tail: "alchemy logs --tail";
    readonly sync: "alchemy drift --repair";
    readonly aws: "alchemy provider aws";
    readonly cloudflare: "alchemy provider cloudflare";
};
export type CompatibilityCommand = keyof typeof compatibilityCommands;
export declare const compatibilityCommand: (name: CompatibilityCommand) => Command.Command<"aws" | "cloudflare" | "login" | "sync" | "tail", {}, {}, never, never>;
//# sourceMappingURL=compat.d.ts.map