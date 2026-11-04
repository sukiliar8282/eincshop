import * as Data from "effect/Data";
/** No `REDIS_URL` in the Function/Service environment. */
export class UrlMissing extends Data.TaggedError("Redis.UrlMissing") {
    get message() {
        return `REDIS_URL missing for ${this.name}`;
    }
}
/** A Redis command failed (RESP error, socket, or protocol). */
export class CommandError extends Data.TaggedError("Redis.CommandError") {
}
/** Redis replied with a RESP error (`-ERR …`, `-WRONGTYPE …`). */
export class ReplyError extends Data.TaggedError("Redis.ReplyError") {
}
/** Bytes on the wire were not valid RESP. */
export class ProtocolError extends Data.TaggedError("Redis.ProtocolError") {
}
//# sourceMappingURL=Errors.js.map