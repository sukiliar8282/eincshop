import * as Layer from "effect/Layer";
import { ClusterEventSource as DocDBClusterEventSourceContract } from "../DocDB/ClusterEventSource.ts";
import * as Lambda from "./Function.ts";
export declare const isDocumentDBEvent: (event: any) => event is {
    eventSourceArn?: string;
    events: unknown[];
};
/** @binding */
export declare const DocDBClusterEventSource: Layer.Layer<DocDBClusterEventSourceContract, never, Lambda.Function>;
//# sourceMappingURL=DocDBClusterEventSource.d.ts.map