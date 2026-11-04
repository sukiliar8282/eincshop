/**
 * Base error properties shared by all SQLite errors.
 */
interface SQLiteErrorProps {
    readonly message: string;
    readonly cause?: unknown;
}
declare const SQLiteError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_ERROR";
} & Readonly<A>;
/**
 * SQLITE_ERROR (1) - Generic error code.
 */
export declare class SQLiteError extends SQLiteError_base<SQLiteErrorProps> {
}
declare const SQLiteInternal_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_INTERNAL";
} & Readonly<A>;
/**
 * SQLITE_INTERNAL (2) - Internal malfunction.
 */
export declare class SQLiteInternal extends SQLiteInternal_base<SQLiteErrorProps> {
}
declare const SQLitePerm_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_PERM";
} & Readonly<A>;
/**
 * SQLITE_PERM (3) - Access permission denied.
 */
export declare class SQLitePerm extends SQLitePerm_base<SQLiteErrorProps> {
}
declare const SQLiteAbort_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_ABORT";
} & Readonly<A>;
/**
 * SQLITE_ABORT (4) - Operation aborted.
 */
export declare class SQLiteAbort extends SQLiteAbort_base<SQLiteErrorProps> {
}
declare const SQLiteBusy_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_BUSY";
} & Readonly<A>;
/**
 * SQLITE_BUSY (5) - Database file is locked.
 */
export declare class SQLiteBusy extends SQLiteBusy_base<SQLiteErrorProps> {
}
declare const SQLiteLocked_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_LOCKED";
} & Readonly<A>;
/**
 * SQLITE_LOCKED (6) - A table in the database is locked.
 */
export declare class SQLiteLocked extends SQLiteLocked_base<SQLiteErrorProps> {
}
declare const SQLiteNomem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_NOMEM";
} & Readonly<A>;
/**
 * SQLITE_NOMEM (7) - Memory allocation failed.
 */
export declare class SQLiteNomem extends SQLiteNomem_base<SQLiteErrorProps> {
}
declare const SQLiteReadonly_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_READONLY";
} & Readonly<A>;
/**
 * SQLITE_READONLY (8) - Attempt to write a readonly database.
 */
export declare class SQLiteReadonly extends SQLiteReadonly_base<SQLiteErrorProps> {
}
declare const SQLiteInterrupt_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_INTERRUPT";
} & Readonly<A>;
/**
 * SQLITE_INTERRUPT (9) - Operation interrupted.
 */
export declare class SQLiteInterrupt extends SQLiteInterrupt_base<SQLiteErrorProps> {
}
declare const SQLiteIoerr_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR";
} & Readonly<A>;
/**
 * SQLITE_IOERR (10) - I/O error.
 */
export declare class SQLiteIoerr extends SQLiteIoerr_base<SQLiteErrorProps> {
}
declare const SQLiteCorrupt_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CORRUPT";
} & Readonly<A>;
/**
 * SQLITE_CORRUPT (11) - Database disk image is malformed.
 */
export declare class SQLiteCorrupt extends SQLiteCorrupt_base<SQLiteErrorProps> {
}
declare const SQLiteNotfound_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_NOTFOUND";
} & Readonly<A>;
/**
 * SQLITE_NOTFOUND (12) - Unknown opcode or table not found.
 */
export declare class SQLiteNotfound extends SQLiteNotfound_base<SQLiteErrorProps> {
}
declare const SQLiteFull_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_FULL";
} & Readonly<A>;
/**
 * SQLITE_FULL (13) - Database or disk is full.
 */
export declare class SQLiteFull extends SQLiteFull_base<SQLiteErrorProps> {
}
declare const SQLiteCantopen_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CANTOPEN";
} & Readonly<A>;
/**
 * SQLITE_CANTOPEN (14) - Unable to open database file.
 */
export declare class SQLiteCantopen extends SQLiteCantopen_base<SQLiteErrorProps> {
}
declare const SQLiteProtocol_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_PROTOCOL";
} & Readonly<A>;
/**
 * SQLITE_PROTOCOL (15) - Database lock protocol error.
 */
export declare class SQLiteProtocol extends SQLiteProtocol_base<SQLiteErrorProps> {
}
declare const SQLiteEmpty_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_EMPTY";
} & Readonly<A>;
/**
 * SQLITE_EMPTY (16) - Internal use only.
 */
export declare class SQLiteEmpty extends SQLiteEmpty_base<SQLiteErrorProps> {
}
declare const SQLiteSchema_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_SCHEMA";
} & Readonly<A>;
/**
 * SQLITE_SCHEMA (17) - Database schema changed.
 */
export declare class SQLiteSchema extends SQLiteSchema_base<SQLiteErrorProps> {
}
declare const SQLiteToobig_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_TOOBIG";
} & Readonly<A>;
/**
 * SQLITE_TOOBIG (18) - String or BLOB exceeds size limit.
 */
export declare class SQLiteToobig extends SQLiteToobig_base<SQLiteErrorProps> {
}
declare const SQLiteConstraint_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CONSTRAINT";
} & Readonly<A>;
/**
 * SQLITE_CONSTRAINT (19) - Constraint violation.
 */
export declare class SQLiteConstraint extends SQLiteConstraint_base<SQLiteErrorProps> {
}
declare const SQLiteMismatch_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_MISMATCH";
} & Readonly<A>;
/**
 * SQLITE_MISMATCH (20) - Data type mismatch.
 */
export declare class SQLiteMismatch extends SQLiteMismatch_base<SQLiteErrorProps> {
}
declare const SQLiteMisuse_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_MISUSE";
} & Readonly<A>;
/**
 * SQLITE_MISUSE (21) - Library used incorrectly.
 */
export declare class SQLiteMisuse extends SQLiteMisuse_base<SQLiteErrorProps> {
}
declare const SQLiteNolfs_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_NOLFS";
} & Readonly<A>;
/**
 * SQLITE_NOLFS (22) - Uses OS features not supported on host.
 */
export declare class SQLiteNolfs extends SQLiteNolfs_base<SQLiteErrorProps> {
}
declare const SQLiteAuth_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_AUTH";
} & Readonly<A>;
/**
 * SQLITE_AUTH (23) - Authorization denied.
 */
export declare class SQLiteAuth extends SQLiteAuth_base<SQLiteErrorProps> {
}
declare const SQLiteFormat_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_FORMAT";
} & Readonly<A>;
/**
 * SQLITE_FORMAT (24) - Not used.
 */
export declare class SQLiteFormat extends SQLiteFormat_base<SQLiteErrorProps> {
}
declare const SQLiteRange_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_RANGE";
} & Readonly<A>;
/**
 * SQLITE_RANGE (25) - 2nd parameter to sqlite3_bind out of range.
 */
export declare class SQLiteRange extends SQLiteRange_base<SQLiteErrorProps> {
}
declare const SQLiteNotadb_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_NOTADB";
} & Readonly<A>;
/**
 * SQLITE_NOTADB (26) - File opened that is not a database file.
 */
export declare class SQLiteNotadb extends SQLiteNotadb_base<SQLiteErrorProps> {
}
declare const SQLiteNotice_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_NOTICE";
} & Readonly<A>;
/**
 * SQLITE_NOTICE (27) - Notifications from sqlite3_log().
 */
export declare class SQLiteNotice extends SQLiteNotice_base<SQLiteErrorProps> {
}
declare const SQLiteWarning_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_WARNING";
} & Readonly<A>;
/**
 * SQLITE_WARNING (28) - Warnings from sqlite3_log().
 */
export declare class SQLiteWarning extends SQLiteWarning_base<SQLiteErrorProps> {
}
declare const SQLiteAbortRollback_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_ABORT_ROLLBACK";
} & Readonly<A>;
export declare class SQLiteAbortRollback extends SQLiteAbortRollback_base<SQLiteErrorProps> {
}
declare const SQLiteAuthUser_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_AUTH_USER";
} & Readonly<A>;
export declare class SQLiteAuthUser extends SQLiteAuthUser_base<SQLiteErrorProps> {
}
declare const SQLiteBusyRecovery_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_BUSY_RECOVERY";
} & Readonly<A>;
export declare class SQLiteBusyRecovery extends SQLiteBusyRecovery_base<SQLiteErrorProps> {
}
declare const SQLiteBusySnapshot_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_BUSY_SNAPSHOT";
} & Readonly<A>;
export declare class SQLiteBusySnapshot extends SQLiteBusySnapshot_base<SQLiteErrorProps> {
}
declare const SQLiteBusyTimeout_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_BUSY_TIMEOUT";
} & Readonly<A>;
export declare class SQLiteBusyTimeout extends SQLiteBusyTimeout_base<SQLiteErrorProps> {
}
declare const SQLiteCantopenConvpath_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CANTOPEN_CONVPATH";
} & Readonly<A>;
export declare class SQLiteCantopenConvpath extends SQLiteCantopenConvpath_base<SQLiteErrorProps> {
}
declare const SQLiteCantopenDirtywal_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CANTOPEN_DIRTYWAL";
} & Readonly<A>;
export declare class SQLiteCantopenDirtywal extends SQLiteCantopenDirtywal_base<SQLiteErrorProps> {
}
declare const SQLiteCantopenFullpath_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CANTOPEN_FULLPATH";
} & Readonly<A>;
export declare class SQLiteCantopenFullpath extends SQLiteCantopenFullpath_base<SQLiteErrorProps> {
}
declare const SQLiteCantopenIsdir_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CANTOPEN_ISDIR";
} & Readonly<A>;
export declare class SQLiteCantopenIsdir extends SQLiteCantopenIsdir_base<SQLiteErrorProps> {
}
declare const SQLiteCantopenNotempdir_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CANTOPEN_NOTEMPDIR";
} & Readonly<A>;
export declare class SQLiteCantopenNotempdir extends SQLiteCantopenNotempdir_base<SQLiteErrorProps> {
}
declare const SQLiteCantopenSymlink_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CANTOPEN_SYMLINK";
} & Readonly<A>;
export declare class SQLiteCantopenSymlink extends SQLiteCantopenSymlink_base<SQLiteErrorProps> {
}
declare const SQLiteConstraintCheck_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CONSTRAINT_CHECK";
} & Readonly<A>;
export declare class SQLiteConstraintCheck extends SQLiteConstraintCheck_base<SQLiteErrorProps> {
}
declare const SQLiteConstraintCommithook_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CONSTRAINT_COMMITHOOK";
} & Readonly<A>;
export declare class SQLiteConstraintCommithook extends SQLiteConstraintCommithook_base<SQLiteErrorProps> {
}
declare const SQLiteConstraintDatatype_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CONSTRAINT_DATATYPE";
} & Readonly<A>;
export declare class SQLiteConstraintDatatype extends SQLiteConstraintDatatype_base<SQLiteErrorProps> {
}
declare const SQLiteConstraintForeignkey_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CONSTRAINT_FOREIGNKEY";
} & Readonly<A>;
export declare class SQLiteConstraintForeignkey extends SQLiteConstraintForeignkey_base<SQLiteErrorProps> {
}
declare const SQLiteConstraintFunction_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CONSTRAINT_FUNCTION";
} & Readonly<A>;
export declare class SQLiteConstraintFunction extends SQLiteConstraintFunction_base<SQLiteErrorProps> {
}
declare const SQLiteConstraintNotnull_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CONSTRAINT_NOTNULL";
} & Readonly<A>;
export declare class SQLiteConstraintNotnull extends SQLiteConstraintNotnull_base<SQLiteErrorProps> {
}
declare const SQLiteConstraintPinned_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CONSTRAINT_PINNED";
} & Readonly<A>;
export declare class SQLiteConstraintPinned extends SQLiteConstraintPinned_base<SQLiteErrorProps> {
}
declare const SQLiteConstraintPrimarykey_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CONSTRAINT_PRIMARYKEY";
} & Readonly<A>;
export declare class SQLiteConstraintPrimarykey extends SQLiteConstraintPrimarykey_base<SQLiteErrorProps> {
}
declare const SQLiteConstraintRowid_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CONSTRAINT_ROWID";
} & Readonly<A>;
export declare class SQLiteConstraintRowid extends SQLiteConstraintRowid_base<SQLiteErrorProps> {
}
declare const SQLiteConstraintTrigger_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CONSTRAINT_TRIGGER";
} & Readonly<A>;
export declare class SQLiteConstraintTrigger extends SQLiteConstraintTrigger_base<SQLiteErrorProps> {
}
declare const SQLiteConstraintUnique_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CONSTRAINT_UNIQUE";
} & Readonly<A>;
export declare class SQLiteConstraintUnique extends SQLiteConstraintUnique_base<SQLiteErrorProps> {
}
declare const SQLiteConstraintVtab_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CONSTRAINT_VTAB";
} & Readonly<A>;
export declare class SQLiteConstraintVtab extends SQLiteConstraintVtab_base<SQLiteErrorProps> {
}
declare const SQLiteCorruptIndex_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CORRUPT_INDEX";
} & Readonly<A>;
export declare class SQLiteCorruptIndex extends SQLiteCorruptIndex_base<SQLiteErrorProps> {
}
declare const SQLiteCorruptSequence_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CORRUPT_SEQUENCE";
} & Readonly<A>;
export declare class SQLiteCorruptSequence extends SQLiteCorruptSequence_base<SQLiteErrorProps> {
}
declare const SQLiteCorruptVtab_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_CORRUPT_VTAB";
} & Readonly<A>;
export declare class SQLiteCorruptVtab extends SQLiteCorruptVtab_base<SQLiteErrorProps> {
}
declare const SQLiteErrorMissingCollseq_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_ERROR_MISSING_COLLSEQ";
} & Readonly<A>;
export declare class SQLiteErrorMissingCollseq extends SQLiteErrorMissingCollseq_base<SQLiteErrorProps> {
}
declare const SQLiteErrorRetry_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_ERROR_RETRY";
} & Readonly<A>;
export declare class SQLiteErrorRetry extends SQLiteErrorRetry_base<SQLiteErrorProps> {
}
declare const SQLiteErrorSnapshot_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_ERROR_SNAPSHOT";
} & Readonly<A>;
export declare class SQLiteErrorSnapshot extends SQLiteErrorSnapshot_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrAccess_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_ACCESS";
} & Readonly<A>;
export declare class SQLiteIoerrAccess extends SQLiteIoerrAccess_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrAuth_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_AUTH";
} & Readonly<A>;
export declare class SQLiteIoerrAuth extends SQLiteIoerrAuth_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrBeginAtomic_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_BEGIN_ATOMIC";
} & Readonly<A>;
export declare class SQLiteIoerrBeginAtomic extends SQLiteIoerrBeginAtomic_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrBlocked_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_BLOCKED";
} & Readonly<A>;
export declare class SQLiteIoerrBlocked extends SQLiteIoerrBlocked_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrCheckreservedlock_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_CHECKRESERVEDLOCK";
} & Readonly<A>;
export declare class SQLiteIoerrCheckreservedlock extends SQLiteIoerrCheckreservedlock_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrClose_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_CLOSE";
} & Readonly<A>;
export declare class SQLiteIoerrClose extends SQLiteIoerrClose_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrCommitAtomic_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_COMMIT_ATOMIC";
} & Readonly<A>;
export declare class SQLiteIoerrCommitAtomic extends SQLiteIoerrCommitAtomic_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrConvpath_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_CONVPATH";
} & Readonly<A>;
export declare class SQLiteIoerrConvpath extends SQLiteIoerrConvpath_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrCorruptfs_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_CORRUPTFS";
} & Readonly<A>;
export declare class SQLiteIoerrCorruptfs extends SQLiteIoerrCorruptfs_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrData_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_DATA";
} & Readonly<A>;
export declare class SQLiteIoerrData extends SQLiteIoerrData_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrDelete_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_DELETE";
} & Readonly<A>;
export declare class SQLiteIoerrDelete extends SQLiteIoerrDelete_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrDeleteNoent_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_DELETE_NOENT";
} & Readonly<A>;
export declare class SQLiteIoerrDeleteNoent extends SQLiteIoerrDeleteNoent_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrDirClose_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_DIR_CLOSE";
} & Readonly<A>;
export declare class SQLiteIoerrDirClose extends SQLiteIoerrDirClose_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrDirFsync_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_DIR_FSYNC";
} & Readonly<A>;
export declare class SQLiteIoerrDirFsync extends SQLiteIoerrDirFsync_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrFstat_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_FSTAT";
} & Readonly<A>;
export declare class SQLiteIoerrFstat extends SQLiteIoerrFstat_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrFsync_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_FSYNC";
} & Readonly<A>;
export declare class SQLiteIoerrFsync extends SQLiteIoerrFsync_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrGettemppath_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_GETTEMPPATH";
} & Readonly<A>;
export declare class SQLiteIoerrGettemppath extends SQLiteIoerrGettemppath_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrLock_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_LOCK";
} & Readonly<A>;
export declare class SQLiteIoerrLock extends SQLiteIoerrLock_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrMmap_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_MMAP";
} & Readonly<A>;
export declare class SQLiteIoerrMmap extends SQLiteIoerrMmap_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrNomem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_NOMEM";
} & Readonly<A>;
export declare class SQLiteIoerrNomem extends SQLiteIoerrNomem_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrRdlock_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_RDLOCK";
} & Readonly<A>;
export declare class SQLiteIoerrRdlock extends SQLiteIoerrRdlock_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrRead_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_READ";
} & Readonly<A>;
export declare class SQLiteIoerrRead extends SQLiteIoerrRead_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrRollbackAtomic_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_ROLLBACK_ATOMIC";
} & Readonly<A>;
export declare class SQLiteIoerrRollbackAtomic extends SQLiteIoerrRollbackAtomic_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrSeek_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_SEEK";
} & Readonly<A>;
export declare class SQLiteIoerrSeek extends SQLiteIoerrSeek_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrShmlock_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_SHMLOCK";
} & Readonly<A>;
export declare class SQLiteIoerrShmlock extends SQLiteIoerrShmlock_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrShmmap_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_SHMMAP";
} & Readonly<A>;
export declare class SQLiteIoerrShmmap extends SQLiteIoerrShmmap_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrShmopen_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_SHMOPEN";
} & Readonly<A>;
export declare class SQLiteIoerrShmopen extends SQLiteIoerrShmopen_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrShmsize_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_SHMSIZE";
} & Readonly<A>;
export declare class SQLiteIoerrShmsize extends SQLiteIoerrShmsize_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrShortRead_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_SHORT_READ";
} & Readonly<A>;
export declare class SQLiteIoerrShortRead extends SQLiteIoerrShortRead_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrTruncate_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_TRUNCATE";
} & Readonly<A>;
export declare class SQLiteIoerrTruncate extends SQLiteIoerrTruncate_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrUnlock_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_UNLOCK";
} & Readonly<A>;
export declare class SQLiteIoerrUnlock extends SQLiteIoerrUnlock_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrVnode_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_VNODE";
} & Readonly<A>;
export declare class SQLiteIoerrVnode extends SQLiteIoerrVnode_base<SQLiteErrorProps> {
}
declare const SQLiteIoerrWrite_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_IOERR_WRITE";
} & Readonly<A>;
export declare class SQLiteIoerrWrite extends SQLiteIoerrWrite_base<SQLiteErrorProps> {
}
declare const SQLiteLockedSharedcache_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_LOCKED_SHAREDCACHE";
} & Readonly<A>;
export declare class SQLiteLockedSharedcache extends SQLiteLockedSharedcache_base<SQLiteErrorProps> {
}
declare const SQLiteLockedVtab_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_LOCKED_VTAB";
} & Readonly<A>;
export declare class SQLiteLockedVtab extends SQLiteLockedVtab_base<SQLiteErrorProps> {
}
declare const SQLiteNoticeRecoverRollback_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_NOTICE_RECOVER_ROLLBACK";
} & Readonly<A>;
export declare class SQLiteNoticeRecoverRollback extends SQLiteNoticeRecoverRollback_base<SQLiteErrorProps> {
}
declare const SQLiteNoticeRecoverWal_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_NOTICE_RECOVER_WAL";
} & Readonly<A>;
export declare class SQLiteNoticeRecoverWal extends SQLiteNoticeRecoverWal_base<SQLiteErrorProps> {
}
declare const SQLiteReadonlyCantinit_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_READONLY_CANTINIT";
} & Readonly<A>;
export declare class SQLiteReadonlyCantinit extends SQLiteReadonlyCantinit_base<SQLiteErrorProps> {
}
declare const SQLiteReadonlyCantlock_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_READONLY_CANTLOCK";
} & Readonly<A>;
export declare class SQLiteReadonlyCantlock extends SQLiteReadonlyCantlock_base<SQLiteErrorProps> {
}
declare const SQLiteReadonlyDbmoved_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_READONLY_DBMOVED";
} & Readonly<A>;
export declare class SQLiteReadonlyDbmoved extends SQLiteReadonlyDbmoved_base<SQLiteErrorProps> {
}
declare const SQLiteReadonlyDirectory_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_READONLY_DIRECTORY";
} & Readonly<A>;
export declare class SQLiteReadonlyDirectory extends SQLiteReadonlyDirectory_base<SQLiteErrorProps> {
}
declare const SQLiteReadonlyRecovery_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_READONLY_RECOVERY";
} & Readonly<A>;
export declare class SQLiteReadonlyRecovery extends SQLiteReadonlyRecovery_base<SQLiteErrorProps> {
}
declare const SQLiteReadonlyRollback_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_READONLY_ROLLBACK";
} & Readonly<A>;
export declare class SQLiteReadonlyRollback extends SQLiteReadonlyRollback_base<SQLiteErrorProps> {
}
declare const SQLiteWarningAutoindex_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_WARNING_AUTOINDEX";
} & Readonly<A>;
export declare class SQLiteWarningAutoindex extends SQLiteWarningAutoindex_base<SQLiteErrorProps> {
}
declare const SQLiteUnknownError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SQLITE_UNKNOWN";
} & Readonly<A>;
/**
 * Fallback for unknown or unrecognized SQLite error codes.
 */
export declare class SQLiteUnknownError extends SQLiteUnknownError_base<SQLiteErrorProps & {
    readonly code?: string;
}> {
}
/**
 * Union of all SQLite error types.
 */
export type SQLiteErrorType = SQLiteError | SQLiteInternal | SQLitePerm | SQLiteAbort | SQLiteBusy | SQLiteLocked | SQLiteNomem | SQLiteReadonly | SQLiteInterrupt | SQLiteIoerr | SQLiteCorrupt | SQLiteNotfound | SQLiteFull | SQLiteCantopen | SQLiteProtocol | SQLiteEmpty | SQLiteSchema | SQLiteToobig | SQLiteConstraint | SQLiteMismatch | SQLiteMisuse | SQLiteNolfs | SQLiteAuth | SQLiteFormat | SQLiteRange | SQLiteNotadb | SQLiteNotice | SQLiteWarning | SQLiteAbortRollback | SQLiteAuthUser | SQLiteBusyRecovery | SQLiteBusySnapshot | SQLiteBusyTimeout | SQLiteCantopenConvpath | SQLiteCantopenDirtywal | SQLiteCantopenFullpath | SQLiteCantopenIsdir | SQLiteCantopenNotempdir | SQLiteCantopenSymlink | SQLiteConstraintCheck | SQLiteConstraintCommithook | SQLiteConstraintDatatype | SQLiteConstraintForeignkey | SQLiteConstraintFunction | SQLiteConstraintNotnull | SQLiteConstraintPinned | SQLiteConstraintPrimarykey | SQLiteConstraintRowid | SQLiteConstraintTrigger | SQLiteConstraintUnique | SQLiteConstraintVtab | SQLiteCorruptIndex | SQLiteCorruptSequence | SQLiteCorruptVtab | SQLiteErrorMissingCollseq | SQLiteErrorRetry | SQLiteErrorSnapshot | SQLiteIoerrAccess | SQLiteIoerrAuth | SQLiteIoerrBeginAtomic | SQLiteIoerrBlocked | SQLiteIoerrCheckreservedlock | SQLiteIoerrClose | SQLiteIoerrCommitAtomic | SQLiteIoerrConvpath | SQLiteIoerrCorruptfs | SQLiteIoerrData | SQLiteIoerrDelete | SQLiteIoerrDeleteNoent | SQLiteIoerrDirClose | SQLiteIoerrDirFsync | SQLiteIoerrFstat | SQLiteIoerrFsync | SQLiteIoerrGettemppath | SQLiteIoerrLock | SQLiteIoerrMmap | SQLiteIoerrNomem | SQLiteIoerrRdlock | SQLiteIoerrRead | SQLiteIoerrRollbackAtomic | SQLiteIoerrSeek | SQLiteIoerrShmlock | SQLiteIoerrShmmap | SQLiteIoerrShmopen | SQLiteIoerrShmsize | SQLiteIoerrShortRead | SQLiteIoerrTruncate | SQLiteIoerrUnlock | SQLiteIoerrVnode | SQLiteIoerrWrite | SQLiteLockedSharedcache | SQLiteLockedVtab | SQLiteNoticeRecoverRollback | SQLiteNoticeRecoverWal | SQLiteReadonlyCantinit | SQLiteReadonlyCantlock | SQLiteReadonlyDbmoved | SQLiteReadonlyDirectory | SQLiteReadonlyRecovery | SQLiteReadonlyRollback | SQLiteWarningAutoindex | SQLiteUnknownError;
/**
 * Type guard to check if an error is a SQLite error with a _tag.
 */
export declare const isSQLiteError: (error: unknown) => error is SQLiteErrorType;
/**
 * Check if the error is retryable (busy or locked errors).
 */
export declare const isRetryable: (e: SQLiteErrorType) => boolean;
/**
 * Parse an error from a SQLite client into a typed error.
 */
export declare const parseError: (code: string | undefined, message: string, cause?: unknown) => SQLiteErrorType;
export {};
//# sourceMappingURL=SQLiteError.d.ts.map