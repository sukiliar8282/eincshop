import * as Effect from "effect/Effect";
import { Self } from "../../Self.js";
import { AccountApiToken } from "../ApiToken/AccountApiToken.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { SendError } from "./QueueTypes.js";
/**
 * Shared scaffolding for the HTTP-backed Queue services.
 *
 * Creates a scoped {@link AccountApiToken}, binds its `value` /
 * `accountId` into the host Worker at deploy time, then delegates to
 * `makeClient` with the bound token and the queue's `queueId`.
 */
export const makeHttpQueueBinding = (options) => Effect.gen(function* () {
    const Token = yield* AccountApiToken;
    const self = yield* Self;
    const env = yield* CloudflareEnvironment;
    return Effect.fn(function* (queue) {
        const { accountId } = yield* env;
        const token = yield* Token(`${self.LogicalId}Token`);
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* token.bind `${queue.LogicalId}`({
                policies: [
                    {
                        effect: "allow",
                        permissionGroups: options.permissionGroups,
                        resources: {
                            [`com.cloudflare.api.account.${accountId}`]: "*",
                        },
                    },
                ],
            });
        }
        const bound = {
            value: yield* token.value,
            accountId: yield* token.accountId,
        };
        const queueId = yield* queue.queueId;
        return options.makeClient(bound, queueId);
    });
});
/** Resolve the account and queue id once per operation. */
export const makeQueueHttpScope = (auth, queueId) => Effect.gen(function* () {
    const accountId = yield* auth.accountId;
    const id = yield* queueId;
    return { accountId, queueId: id };
});
export const toQueueSendError = (error) => new SendError({
    message: typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : "Unknown queue error",
    cause: error,
});
const QUEUE_HTTP_PERMISSION_GROUPS = [
    "Queues Read",
    "Queues Write",
];
//# sourceMappingURL=QueueHttp.js.map