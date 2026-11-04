import * as Layer from "effect/Layer";
import { CliKit } from "./CliKit.ts";
import type { CliKitCapabilities, CliKitOptions } from "../components/types.ts";
export declare const resolveCapabilities: (options: CliKitOptions) => CliKitCapabilities;
/** Provides one terminal runtime for the enclosing scope. */
export declare const layer: (options?: CliKitOptions) => Layer.Layer<CliKit, never, never>;
//# sourceMappingURL=layer.d.ts.map