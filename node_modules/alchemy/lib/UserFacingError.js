import * as Predicate from "effect/Predicate";
/**
 * Marker for error classes whose `message` is written for end users. The CLI's
 * top-level handler prints a marked error's `message` as a single friendly
 * line instead of dumping the raw cause chain.
 *
 * Mark a class by assigning the symbol in the class body:
 *
 * ```ts
 * export class MyError extends Data.TaggedError("MyError")<{
 *   readonly message: string;
 * }> {
 *   readonly [UserFacingError] = true;
 * }
 * ```
 *
 * Classes without a human-readable `message` prop derive one with a getter
 * (see `AlchemistNotFound` in `Alchemist/Errors.ts`).
 */
export const UserFacingError = Symbol.for("alchemy/UserFacingError");
export const isUserFacing = (error) => Predicate.hasProperty(error, UserFacingError) &&
    error[UserFacingError] === true &&
    Predicate.hasProperty(error, "message") &&
    typeof error.message === "string";
//# sourceMappingURL=UserFacingError.js.map