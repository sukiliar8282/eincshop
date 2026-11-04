import * as Layer from "effect/Layer";
import type * as Prompt from "effect/unstable/cli/Prompt";
import type { Cli } from "../Report.ts";
import { CliKit } from "./CliKit/CliKit.ts";
/** Select the interactive or append-only root renderer. */
export declare const selectCliServices: () => Layer.Layer<Cli, never, CliKit | Prompt.Environment>;
//# sourceMappingURL=selectCli.d.ts.map