import { Effect } from "effect";
import * as Apply from "./Apply.js";
import * as Plan from "./Plan.js";
import { evalStack } from "./Stack.js";
export const destroy = ({ stack, stage, dev, scope, }) => evalStack(stack, (stack) => Plan.destroy(stack).pipe(Effect.flatMap(Apply.apply)), { stage, dev, scope });
//# sourceMappingURL=Destroy.js.map