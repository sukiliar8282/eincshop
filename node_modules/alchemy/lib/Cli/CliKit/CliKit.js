import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
/** The sole injected owner of terminal rendering and input for a CLI process. */
export class CliKit extends Context.Service()("Alchemy::CliKit") {
}
/** Effectful service accessors for code that must defer acquisition to use time. */
export const accessors = {
    output: {
        info: (message) => Effect.flatMap(CliKit, (service) => service.output.info(message)),
        success: (message) => Effect.flatMap(CliKit, (service) => service.output.success(message)),
        warning: (message) => Effect.flatMap(CliKit, (service) => service.output.warning(message)),
        error: (message) => Effect.flatMap(CliKit, (service) => service.output.error(message)),
    },
    prompt: {
        text: (options) => Effect.flatMap(CliKit, (service) => service.prompt.text(options)),
        password: (options) => Effect.flatMap(CliKit, (service) => service.prompt.password(options)),
        confirm: (options) => Effect.flatMap(CliKit, (service) => service.prompt.confirm(options)),
        select: (options) => Effect.flatMap(CliKit, (service) => service.prompt.select(options)),
        multiSelect: (options) => Effect.flatMap(CliKit, (service) => service.prompt.multiSelect(options)),
    },
};
export const ApplicationPresentation = Context.Reference("Alchemy::CliKit/ApplicationPresentation", { defaultValue: () => "inline" });
/** Pipeable presentation modifiers for {@link CliKit.application}. */
export const Application = {
    alternate: (effect) => effect.pipe(Effect.provideService(ApplicationPresentation, "alternate")),
};
//# sourceMappingURL=CliKit.js.map