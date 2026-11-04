import { CliKit } from "../../CliKit/CliKit.ts";
import type { CliKitCapabilities, CliKitOptions } from "../types.ts";
export interface CliKitRuntime {
    readonly service: CliKit["Service"];
    readonly dispose: () => Promise<void>;
}
export declare const makeRuntime: (options: CliKitOptions, capabilities: CliKitCapabilities) => CliKitRuntime;
//# sourceMappingURL=Runtime.d.ts.map