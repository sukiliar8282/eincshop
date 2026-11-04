import type { Input } from "../../Input.ts";
import * as Output from "../../Output.ts";
/**
 * Derive an account-global Workflow name from its unique host Worker name and
 * exported class. The hash preserves uniqueness when the readable prefix must
 * be truncated to Cloudflare's 64-character limit.
 *
 * @internal
 */
export declare const makeWorkflowName: (scriptName: Input<string>, className: string) => Output.Output<string>;
//# sourceMappingURL=WorkflowName.d.ts.map