import type { ConfirmOptions, CycleSelectOptions, AwaitExternalOptions, MenuOptions, MultiSelectOptions, PasswordInputOptions, Screen, SelectOptions, TextInputOptions } from "../types.ts";
export declare const textScreen: (options: TextInputOptions) => Screen<string>;
export declare const passwordScreen: (options: PasswordInputOptions) => Screen<string>;
export declare const selectScreen: <Value>(options: SelectOptions<Value>) => Screen<Value>;
export declare const menuScreen: <Value>(options: MenuOptions<Value>) => Screen<Value>;
export declare const multiSelectScreen: <Value>(options: MultiSelectOptions<Value>) => Screen<ReadonlyArray<Value>>;
export declare const cycleSelectScreen: <State>(options: CycleSelectOptions<State>) => Screen<ReadonlyArray<State>>;
export declare const awaitExternalScreen: (options: AwaitExternalOptions) => Screen<string>;
export declare const confirmScreen: (options: ConfirmOptions) => Screen<boolean>;
//# sourceMappingURL=Prompts.d.ts.map