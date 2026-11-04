/**
 * Shared name-mangling helpers for Prisma physical names and binding env
 * keys. Internal — not exported from the Prisma package surface.
 */
export declare const fnv1a64: (value: string) => string;
/**
 * Deterministic physical name for a cloud object owned by one resource
 * instance: the logical name plus a 12-character token of the instance
 * identity, inside a 65-character budget. Stable across retries, so a create
 * whose response was lost (crash after the POST but before the state persist)
 * can be recovered by name instead of minting a second object.
 */
export declare const physicalInstanceName: (name: string, instanceId: string) => string;
export declare const envName: (value: string) => string;
//# sourceMappingURL=EnvName.d.ts.map