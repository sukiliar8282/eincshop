import * as Layer from "effect/Layer";
import { Worker, WorkerEnvironment } from "../Workers/Worker.ts";
import { Connect } from "./Connect.ts";
import type { Connection } from "./Connection.ts";
import { type DevOrigin } from "./Connection.ts";
export declare const ConnectBinding: Layer.Layer<Connect, never, WorkerEnvironment | Worker<any>>;
export declare const getHyperdriveDevOrigin: (connection: Connection) => Record<string, Required<DevOrigin>>;
//# sourceMappingURL=ConnectBinding.d.ts.map