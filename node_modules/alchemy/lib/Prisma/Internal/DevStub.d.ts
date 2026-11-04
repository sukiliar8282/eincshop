import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import type { ResourceClass, ResourceLike } from "../../Resource.ts";
/**
 * Shared helpers for the Prisma providers' local (`alchemy dev`) variants.
 * Local variants fabricate deterministic `dev:`-prefixed identifiers and
 * never talk to the Prisma Management API.
 */
export type DevRecord = Record<string, unknown>;
export declare const DEV_TIMESTAMP = "1970-01-01T00:00:00.000Z";
export declare const devId: (type: string, id: string) => string;
export declare const isRecord: (value: unknown) => value is DevRecord;
export declare const attrOrString: (value: unknown, attrName: string) => string | undefined;
export declare const attrOrNullableString: (value: unknown, key: string) => string | null | undefined;
export declare const attrOrRedactedString: (value: unknown, key: string) => Redacted.Redacted<string> | undefined;
/**
 * Build a stateless local provider stub: reconcile merges the previous
 * outputs with freshly fabricated attributes, read echoes persisted state,
 * and delete is a no-op.
 */
export declare const devProvider: <R extends ResourceLike>(resource: ResourceClass<R>, stables: Extract<keyof R["Attributes"], string>[], attrs: (input: {
    id: string;
    news: DevRecord;
    output?: DevRecord;
}) => DevRecord) => import("effect/Layer").Layer<Provider.Provider<R>, never, never>;
//# sourceMappingURL=DevStub.d.ts.map