import * as Effect from "effect/Effect";
import { createPhysicalName } from "../../PhysicalName.js";
export const createWorkerName = (id, name) => name
    ? Effect.succeed(name)
    : createPhysicalName({
        id,
        maxLength: 54,
    }).pipe(Effect.map((name) => name.toLowerCase()));
//# sourceMappingURL=WorkerName.js.map