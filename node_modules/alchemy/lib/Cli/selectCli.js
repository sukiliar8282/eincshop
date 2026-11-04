import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as CliOutput from "effect/unstable/cli/CliOutput";
import { CliKit } from "./CliKit/CliKit.js";
import { LoggingCli } from "./LoggingCli.js";
import { plainCliFormatter } from "./PlainCliFormatter.js";
/** Select the interactive or append-only root renderer. */
export const selectCliServices = () => Layer.unwrap(Effect.gen(function* () {
    const cli = yield* CliKit;
    if (!cli.terminal.input) {
        const plain = Layer.mergeAll(LoggingCli, CliOutput.layer(plainCliFormatter({ columns: cli.terminal.columns })));
        return plain;
    }
    return yield* Effect.promise(async () => {
        const { sigilCli } = await import("./components/view/SigilCli.js");
        const { brandedCliFormatter } = await import("./components/view/Help.js");
        return Layer.mergeAll(sigilCli(), CliOutput.layer(brandedCliFormatter(cli)));
    });
}));
//# sourceMappingURL=selectCli.js.map