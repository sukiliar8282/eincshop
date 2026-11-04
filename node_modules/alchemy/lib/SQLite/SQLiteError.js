import * as Data from "effect/Data";
// =============================================================================
// Primary Result Codes
// =============================================================================
/**
 * SQLITE_ERROR (1) - Generic error code.
 */
export class SQLiteError extends Data.TaggedError("SQLITE_ERROR") {
}
/**
 * SQLITE_INTERNAL (2) - Internal malfunction.
 */
export class SQLiteInternal extends Data.TaggedError("SQLITE_INTERNAL") {
}
/**
 * SQLITE_PERM (3) - Access permission denied.
 */
export class SQLitePerm extends Data.TaggedError("SQLITE_PERM") {
}
/**
 * SQLITE_ABORT (4) - Operation aborted.
 */
export class SQLiteAbort extends Data.TaggedError("SQLITE_ABORT") {
}
/**
 * SQLITE_BUSY (5) - Database file is locked.
 */
export class SQLiteBusy extends Data.TaggedError("SQLITE_BUSY") {
}
/**
 * SQLITE_LOCKED (6) - A table in the database is locked.
 */
export class SQLiteLocked extends Data.TaggedError("SQLITE_LOCKED") {
}
/**
 * SQLITE_NOMEM (7) - Memory allocation failed.
 */
export class SQLiteNomem extends Data.TaggedError("SQLITE_NOMEM") {
}
/**
 * SQLITE_READONLY (8) - Attempt to write a readonly database.
 */
export class SQLiteReadonly extends Data.TaggedError("SQLITE_READONLY") {
}
/**
 * SQLITE_INTERRUPT (9) - Operation interrupted.
 */
export class SQLiteInterrupt extends Data.TaggedError("SQLITE_INTERRUPT") {
}
/**
 * SQLITE_IOERR (10) - I/O error.
 */
export class SQLiteIoerr extends Data.TaggedError("SQLITE_IOERR") {
}
/**
 * SQLITE_CORRUPT (11) - Database disk image is malformed.
 */
export class SQLiteCorrupt extends Data.TaggedError("SQLITE_CORRUPT") {
}
/**
 * SQLITE_NOTFOUND (12) - Unknown opcode or table not found.
 */
export class SQLiteNotfound extends Data.TaggedError("SQLITE_NOTFOUND") {
}
/**
 * SQLITE_FULL (13) - Database or disk is full.
 */
export class SQLiteFull extends Data.TaggedError("SQLITE_FULL") {
}
/**
 * SQLITE_CANTOPEN (14) - Unable to open database file.
 */
export class SQLiteCantopen extends Data.TaggedError("SQLITE_CANTOPEN") {
}
/**
 * SQLITE_PROTOCOL (15) - Database lock protocol error.
 */
export class SQLiteProtocol extends Data.TaggedError("SQLITE_PROTOCOL") {
}
/**
 * SQLITE_EMPTY (16) - Internal use only.
 */
export class SQLiteEmpty extends Data.TaggedError("SQLITE_EMPTY") {
}
/**
 * SQLITE_SCHEMA (17) - Database schema changed.
 */
export class SQLiteSchema extends Data.TaggedError("SQLITE_SCHEMA") {
}
/**
 * SQLITE_TOOBIG (18) - String or BLOB exceeds size limit.
 */
export class SQLiteToobig extends Data.TaggedError("SQLITE_TOOBIG") {
}
/**
 * SQLITE_CONSTRAINT (19) - Constraint violation.
 */
export class SQLiteConstraint extends Data.TaggedError("SQLITE_CONSTRAINT") {
}
/**
 * SQLITE_MISMATCH (20) - Data type mismatch.
 */
export class SQLiteMismatch extends Data.TaggedError("SQLITE_MISMATCH") {
}
/**
 * SQLITE_MISUSE (21) - Library used incorrectly.
 */
export class SQLiteMisuse extends Data.TaggedError("SQLITE_MISUSE") {
}
/**
 * SQLITE_NOLFS (22) - Uses OS features not supported on host.
 */
export class SQLiteNolfs extends Data.TaggedError("SQLITE_NOLFS") {
}
/**
 * SQLITE_AUTH (23) - Authorization denied.
 */
export class SQLiteAuth extends Data.TaggedError("SQLITE_AUTH") {
}
/**
 * SQLITE_FORMAT (24) - Not used.
 */
export class SQLiteFormat extends Data.TaggedError("SQLITE_FORMAT") {
}
/**
 * SQLITE_RANGE (25) - 2nd parameter to sqlite3_bind out of range.
 */
export class SQLiteRange extends Data.TaggedError("SQLITE_RANGE") {
}
/**
 * SQLITE_NOTADB (26) - File opened that is not a database file.
 */
export class SQLiteNotadb extends Data.TaggedError("SQLITE_NOTADB") {
}
/**
 * SQLITE_NOTICE (27) - Notifications from sqlite3_log().
 */
export class SQLiteNotice extends Data.TaggedError("SQLITE_NOTICE") {
}
/**
 * SQLITE_WARNING (28) - Warnings from sqlite3_log().
 */
export class SQLiteWarning extends Data.TaggedError("SQLITE_WARNING") {
}
// =============================================================================
// Extended Result Codes - ABORT
// =============================================================================
export class SQLiteAbortRollback extends Data.TaggedError("SQLITE_ABORT_ROLLBACK") {
}
// =============================================================================
// Extended Result Codes - AUTH
// =============================================================================
export class SQLiteAuthUser extends Data.TaggedError("SQLITE_AUTH_USER") {
}
// =============================================================================
// Extended Result Codes - BUSY
// =============================================================================
export class SQLiteBusyRecovery extends Data.TaggedError("SQLITE_BUSY_RECOVERY") {
}
export class SQLiteBusySnapshot extends Data.TaggedError("SQLITE_BUSY_SNAPSHOT") {
}
export class SQLiteBusyTimeout extends Data.TaggedError("SQLITE_BUSY_TIMEOUT") {
}
// =============================================================================
// Extended Result Codes - CANTOPEN
// =============================================================================
export class SQLiteCantopenConvpath extends Data.TaggedError("SQLITE_CANTOPEN_CONVPATH") {
}
export class SQLiteCantopenDirtywal extends Data.TaggedError("SQLITE_CANTOPEN_DIRTYWAL") {
}
export class SQLiteCantopenFullpath extends Data.TaggedError("SQLITE_CANTOPEN_FULLPATH") {
}
export class SQLiteCantopenIsdir extends Data.TaggedError("SQLITE_CANTOPEN_ISDIR") {
}
export class SQLiteCantopenNotempdir extends Data.TaggedError("SQLITE_CANTOPEN_NOTEMPDIR") {
}
export class SQLiteCantopenSymlink extends Data.TaggedError("SQLITE_CANTOPEN_SYMLINK") {
}
// =============================================================================
// Extended Result Codes - CONSTRAINT
// =============================================================================
export class SQLiteConstraintCheck extends Data.TaggedError("SQLITE_CONSTRAINT_CHECK") {
}
export class SQLiteConstraintCommithook extends Data.TaggedError("SQLITE_CONSTRAINT_COMMITHOOK") {
}
export class SQLiteConstraintDatatype extends Data.TaggedError("SQLITE_CONSTRAINT_DATATYPE") {
}
export class SQLiteConstraintForeignkey extends Data.TaggedError("SQLITE_CONSTRAINT_FOREIGNKEY") {
}
export class SQLiteConstraintFunction extends Data.TaggedError("SQLITE_CONSTRAINT_FUNCTION") {
}
export class SQLiteConstraintNotnull extends Data.TaggedError("SQLITE_CONSTRAINT_NOTNULL") {
}
export class SQLiteConstraintPinned extends Data.TaggedError("SQLITE_CONSTRAINT_PINNED") {
}
export class SQLiteConstraintPrimarykey extends Data.TaggedError("SQLITE_CONSTRAINT_PRIMARYKEY") {
}
export class SQLiteConstraintRowid extends Data.TaggedError("SQLITE_CONSTRAINT_ROWID") {
}
export class SQLiteConstraintTrigger extends Data.TaggedError("SQLITE_CONSTRAINT_TRIGGER") {
}
export class SQLiteConstraintUnique extends Data.TaggedError("SQLITE_CONSTRAINT_UNIQUE") {
}
export class SQLiteConstraintVtab extends Data.TaggedError("SQLITE_CONSTRAINT_VTAB") {
}
// =============================================================================
// Extended Result Codes - CORRUPT
// =============================================================================
export class SQLiteCorruptIndex extends Data.TaggedError("SQLITE_CORRUPT_INDEX") {
}
export class SQLiteCorruptSequence extends Data.TaggedError("SQLITE_CORRUPT_SEQUENCE") {
}
export class SQLiteCorruptVtab extends Data.TaggedError("SQLITE_CORRUPT_VTAB") {
}
// =============================================================================
// Extended Result Codes - ERROR
// =============================================================================
export class SQLiteErrorMissingCollseq extends Data.TaggedError("SQLITE_ERROR_MISSING_COLLSEQ") {
}
export class SQLiteErrorRetry extends Data.TaggedError("SQLITE_ERROR_RETRY") {
}
export class SQLiteErrorSnapshot extends Data.TaggedError("SQLITE_ERROR_SNAPSHOT") {
}
// =============================================================================
// Extended Result Codes - IOERR
// =============================================================================
export class SQLiteIoerrAccess extends Data.TaggedError("SQLITE_IOERR_ACCESS") {
}
export class SQLiteIoerrAuth extends Data.TaggedError("SQLITE_IOERR_AUTH") {
}
export class SQLiteIoerrBeginAtomic extends Data.TaggedError("SQLITE_IOERR_BEGIN_ATOMIC") {
}
export class SQLiteIoerrBlocked extends Data.TaggedError("SQLITE_IOERR_BLOCKED") {
}
export class SQLiteIoerrCheckreservedlock extends Data.TaggedError("SQLITE_IOERR_CHECKRESERVEDLOCK") {
}
export class SQLiteIoerrClose extends Data.TaggedError("SQLITE_IOERR_CLOSE") {
}
export class SQLiteIoerrCommitAtomic extends Data.TaggedError("SQLITE_IOERR_COMMIT_ATOMIC") {
}
export class SQLiteIoerrConvpath extends Data.TaggedError("SQLITE_IOERR_CONVPATH") {
}
export class SQLiteIoerrCorruptfs extends Data.TaggedError("SQLITE_IOERR_CORRUPTFS") {
}
export class SQLiteIoerrData extends Data.TaggedError("SQLITE_IOERR_DATA") {
}
export class SQLiteIoerrDelete extends Data.TaggedError("SQLITE_IOERR_DELETE") {
}
export class SQLiteIoerrDeleteNoent extends Data.TaggedError("SQLITE_IOERR_DELETE_NOENT") {
}
export class SQLiteIoerrDirClose extends Data.TaggedError("SQLITE_IOERR_DIR_CLOSE") {
}
export class SQLiteIoerrDirFsync extends Data.TaggedError("SQLITE_IOERR_DIR_FSYNC") {
}
export class SQLiteIoerrFstat extends Data.TaggedError("SQLITE_IOERR_FSTAT") {
}
export class SQLiteIoerrFsync extends Data.TaggedError("SQLITE_IOERR_FSYNC") {
}
export class SQLiteIoerrGettemppath extends Data.TaggedError("SQLITE_IOERR_GETTEMPPATH") {
}
export class SQLiteIoerrLock extends Data.TaggedError("SQLITE_IOERR_LOCK") {
}
export class SQLiteIoerrMmap extends Data.TaggedError("SQLITE_IOERR_MMAP") {
}
export class SQLiteIoerrNomem extends Data.TaggedError("SQLITE_IOERR_NOMEM") {
}
export class SQLiteIoerrRdlock extends Data.TaggedError("SQLITE_IOERR_RDLOCK") {
}
export class SQLiteIoerrRead extends Data.TaggedError("SQLITE_IOERR_READ") {
}
export class SQLiteIoerrRollbackAtomic extends Data.TaggedError("SQLITE_IOERR_ROLLBACK_ATOMIC") {
}
export class SQLiteIoerrSeek extends Data.TaggedError("SQLITE_IOERR_SEEK") {
}
export class SQLiteIoerrShmlock extends Data.TaggedError("SQLITE_IOERR_SHMLOCK") {
}
export class SQLiteIoerrShmmap extends Data.TaggedError("SQLITE_IOERR_SHMMAP") {
}
export class SQLiteIoerrShmopen extends Data.TaggedError("SQLITE_IOERR_SHMOPEN") {
}
export class SQLiteIoerrShmsize extends Data.TaggedError("SQLITE_IOERR_SHMSIZE") {
}
export class SQLiteIoerrShortRead extends Data.TaggedError("SQLITE_IOERR_SHORT_READ") {
}
export class SQLiteIoerrTruncate extends Data.TaggedError("SQLITE_IOERR_TRUNCATE") {
}
export class SQLiteIoerrUnlock extends Data.TaggedError("SQLITE_IOERR_UNLOCK") {
}
export class SQLiteIoerrVnode extends Data.TaggedError("SQLITE_IOERR_VNODE") {
}
export class SQLiteIoerrWrite extends Data.TaggedError("SQLITE_IOERR_WRITE") {
}
// =============================================================================
// Extended Result Codes - LOCKED
// =============================================================================
export class SQLiteLockedSharedcache extends Data.TaggedError("SQLITE_LOCKED_SHAREDCACHE") {
}
export class SQLiteLockedVtab extends Data.TaggedError("SQLITE_LOCKED_VTAB") {
}
// =============================================================================
// Extended Result Codes - NOTICE
// =============================================================================
export class SQLiteNoticeRecoverRollback extends Data.TaggedError("SQLITE_NOTICE_RECOVER_ROLLBACK") {
}
export class SQLiteNoticeRecoverWal extends Data.TaggedError("SQLITE_NOTICE_RECOVER_WAL") {
}
// =============================================================================
// Extended Result Codes - READONLY
// =============================================================================
export class SQLiteReadonlyCantinit extends Data.TaggedError("SQLITE_READONLY_CANTINIT") {
}
export class SQLiteReadonlyCantlock extends Data.TaggedError("SQLITE_READONLY_CANTLOCK") {
}
export class SQLiteReadonlyDbmoved extends Data.TaggedError("SQLITE_READONLY_DBMOVED") {
}
export class SQLiteReadonlyDirectory extends Data.TaggedError("SQLITE_READONLY_DIRECTORY") {
}
export class SQLiteReadonlyRecovery extends Data.TaggedError("SQLITE_READONLY_RECOVERY") {
}
export class SQLiteReadonlyRollback extends Data.TaggedError("SQLITE_READONLY_ROLLBACK") {
}
// =============================================================================
// Extended Result Codes - WARNING
// =============================================================================
export class SQLiteWarningAutoindex extends Data.TaggedError("SQLITE_WARNING_AUTOINDEX") {
}
// =============================================================================
// Unknown Error (fallback)
// =============================================================================
/**
 * Fallback for unknown or unrecognized SQLite error codes.
 */
export class SQLiteUnknownError extends Data.TaggedError("SQLITE_UNKNOWN") {
}
// =============================================================================
// Helper Functions
// =============================================================================
/**
 * Type guard to check if an error is a SQLite error with a _tag.
 */
export const isSQLiteError = (error) => {
    return (typeof error === "object" &&
        error !== null &&
        "_tag" in error &&
        typeof error._tag === "string" &&
        error._tag.startsWith("SQLITE_"));
};
/**
 * Check if the error is retryable (busy or locked errors).
 */
export const isRetryable = (e) => {
    switch (e._tag) {
        case "SQLITE_BUSY":
        case "SQLITE_BUSY_RECOVERY":
        case "SQLITE_BUSY_SNAPSHOT":
        case "SQLITE_BUSY_TIMEOUT":
        case "SQLITE_LOCKED":
        case "SQLITE_LOCKED_SHAREDCACHE":
        case "SQLITE_LOCKED_VTAB":
            return true;
        default:
            return false;
    }
};
/**
 * Parse an error from a SQLite client into a typed error.
 */
export const parseError = (code, message, cause) => {
    switch (code) {
        // Primary result codes
        case "SQLITE_ERROR":
            return new SQLiteError({ message, cause });
        case "SQLITE_INTERNAL":
            return new SQLiteInternal({ message, cause });
        case "SQLITE_PERM":
            return new SQLitePerm({ message, cause });
        case "SQLITE_ABORT":
            return new SQLiteAbort({ message, cause });
        case "SQLITE_BUSY":
            return new SQLiteBusy({ message, cause });
        case "SQLITE_LOCKED":
            return new SQLiteLocked({ message, cause });
        case "SQLITE_NOMEM":
            return new SQLiteNomem({ message, cause });
        case "SQLITE_READONLY":
            return new SQLiteReadonly({ message, cause });
        case "SQLITE_INTERRUPT":
            return new SQLiteInterrupt({ message, cause });
        case "SQLITE_IOERR":
            return new SQLiteIoerr({ message, cause });
        case "SQLITE_CORRUPT":
            return new SQLiteCorrupt({ message, cause });
        case "SQLITE_NOTFOUND":
            return new SQLiteNotfound({ message, cause });
        case "SQLITE_FULL":
            return new SQLiteFull({ message, cause });
        case "SQLITE_CANTOPEN":
            return new SQLiteCantopen({ message, cause });
        case "SQLITE_PROTOCOL":
            return new SQLiteProtocol({ message, cause });
        case "SQLITE_EMPTY":
            return new SQLiteEmpty({ message, cause });
        case "SQLITE_SCHEMA":
            return new SQLiteSchema({ message, cause });
        case "SQLITE_TOOBIG":
            return new SQLiteToobig({ message, cause });
        case "SQLITE_CONSTRAINT":
            return new SQLiteConstraint({ message, cause });
        case "SQLITE_MISMATCH":
            return new SQLiteMismatch({ message, cause });
        case "SQLITE_MISUSE":
            return new SQLiteMisuse({ message, cause });
        case "SQLITE_NOLFS":
            return new SQLiteNolfs({ message, cause });
        case "SQLITE_AUTH":
            return new SQLiteAuth({ message, cause });
        case "SQLITE_FORMAT":
            return new SQLiteFormat({ message, cause });
        case "SQLITE_RANGE":
            return new SQLiteRange({ message, cause });
        case "SQLITE_NOTADB":
            return new SQLiteNotadb({ message, cause });
        case "SQLITE_NOTICE":
            return new SQLiteNotice({ message, cause });
        case "SQLITE_WARNING":
            return new SQLiteWarning({ message, cause });
        // Extended - ABORT
        case "SQLITE_ABORT_ROLLBACK":
            return new SQLiteAbortRollback({ message, cause });
        // Extended - AUTH
        case "SQLITE_AUTH_USER":
            return new SQLiteAuthUser({ message, cause });
        // Extended - BUSY
        case "SQLITE_BUSY_RECOVERY":
            return new SQLiteBusyRecovery({ message, cause });
        case "SQLITE_BUSY_SNAPSHOT":
            return new SQLiteBusySnapshot({ message, cause });
        case "SQLITE_BUSY_TIMEOUT":
            return new SQLiteBusyTimeout({ message, cause });
        // Extended - CANTOPEN
        case "SQLITE_CANTOPEN_CONVPATH":
            return new SQLiteCantopenConvpath({ message, cause });
        case "SQLITE_CANTOPEN_DIRTYWAL":
            return new SQLiteCantopenDirtywal({ message, cause });
        case "SQLITE_CANTOPEN_FULLPATH":
            return new SQLiteCantopenFullpath({ message, cause });
        case "SQLITE_CANTOPEN_ISDIR":
            return new SQLiteCantopenIsdir({ message, cause });
        case "SQLITE_CANTOPEN_NOTEMPDIR":
            return new SQLiteCantopenNotempdir({ message, cause });
        case "SQLITE_CANTOPEN_SYMLINK":
            return new SQLiteCantopenSymlink({ message, cause });
        // Extended - CONSTRAINT
        case "SQLITE_CONSTRAINT_CHECK":
            return new SQLiteConstraintCheck({ message, cause });
        case "SQLITE_CONSTRAINT_COMMITHOOK":
            return new SQLiteConstraintCommithook({ message, cause });
        case "SQLITE_CONSTRAINT_DATATYPE":
            return new SQLiteConstraintDatatype({ message, cause });
        case "SQLITE_CONSTRAINT_FOREIGNKEY":
            return new SQLiteConstraintForeignkey({ message, cause });
        case "SQLITE_CONSTRAINT_FUNCTION":
            return new SQLiteConstraintFunction({ message, cause });
        case "SQLITE_CONSTRAINT_NOTNULL":
            return new SQLiteConstraintNotnull({ message, cause });
        case "SQLITE_CONSTRAINT_PINNED":
            return new SQLiteConstraintPinned({ message, cause });
        case "SQLITE_CONSTRAINT_PRIMARYKEY":
            return new SQLiteConstraintPrimarykey({ message, cause });
        case "SQLITE_CONSTRAINT_ROWID":
            return new SQLiteConstraintRowid({ message, cause });
        case "SQLITE_CONSTRAINT_TRIGGER":
            return new SQLiteConstraintTrigger({ message, cause });
        case "SQLITE_CONSTRAINT_UNIQUE":
            return new SQLiteConstraintUnique({ message, cause });
        case "SQLITE_CONSTRAINT_VTAB":
            return new SQLiteConstraintVtab({ message, cause });
        // Extended - CORRUPT
        case "SQLITE_CORRUPT_INDEX":
            return new SQLiteCorruptIndex({ message, cause });
        case "SQLITE_CORRUPT_SEQUENCE":
            return new SQLiteCorruptSequence({ message, cause });
        case "SQLITE_CORRUPT_VTAB":
            return new SQLiteCorruptVtab({ message, cause });
        // Extended - ERROR
        case "SQLITE_ERROR_MISSING_COLLSEQ":
            return new SQLiteErrorMissingCollseq({ message, cause });
        case "SQLITE_ERROR_RETRY":
            return new SQLiteErrorRetry({ message, cause });
        case "SQLITE_ERROR_SNAPSHOT":
            return new SQLiteErrorSnapshot({ message, cause });
        // Extended - IOERR
        case "SQLITE_IOERR_ACCESS":
            return new SQLiteIoerrAccess({ message, cause });
        case "SQLITE_IOERR_AUTH":
            return new SQLiteIoerrAuth({ message, cause });
        case "SQLITE_IOERR_BEGIN_ATOMIC":
            return new SQLiteIoerrBeginAtomic({ message, cause });
        case "SQLITE_IOERR_BLOCKED":
            return new SQLiteIoerrBlocked({ message, cause });
        case "SQLITE_IOERR_CHECKRESERVEDLOCK":
            return new SQLiteIoerrCheckreservedlock({ message, cause });
        case "SQLITE_IOERR_CLOSE":
            return new SQLiteIoerrClose({ message, cause });
        case "SQLITE_IOERR_COMMIT_ATOMIC":
            return new SQLiteIoerrCommitAtomic({ message, cause });
        case "SQLITE_IOERR_CONVPATH":
            return new SQLiteIoerrConvpath({ message, cause });
        case "SQLITE_IOERR_CORRUPTFS":
            return new SQLiteIoerrCorruptfs({ message, cause });
        case "SQLITE_IOERR_DATA":
            return new SQLiteIoerrData({ message, cause });
        case "SQLITE_IOERR_DELETE":
            return new SQLiteIoerrDelete({ message, cause });
        case "SQLITE_IOERR_DELETE_NOENT":
            return new SQLiteIoerrDeleteNoent({ message, cause });
        case "SQLITE_IOERR_DIR_CLOSE":
            return new SQLiteIoerrDirClose({ message, cause });
        case "SQLITE_IOERR_DIR_FSYNC":
            return new SQLiteIoerrDirFsync({ message, cause });
        case "SQLITE_IOERR_FSTAT":
            return new SQLiteIoerrFstat({ message, cause });
        case "SQLITE_IOERR_FSYNC":
            return new SQLiteIoerrFsync({ message, cause });
        case "SQLITE_IOERR_GETTEMPPATH":
            return new SQLiteIoerrGettemppath({ message, cause });
        case "SQLITE_IOERR_LOCK":
            return new SQLiteIoerrLock({ message, cause });
        case "SQLITE_IOERR_MMAP":
            return new SQLiteIoerrMmap({ message, cause });
        case "SQLITE_IOERR_NOMEM":
            return new SQLiteIoerrNomem({ message, cause });
        case "SQLITE_IOERR_RDLOCK":
            return new SQLiteIoerrRdlock({ message, cause });
        case "SQLITE_IOERR_READ":
            return new SQLiteIoerrRead({ message, cause });
        case "SQLITE_IOERR_ROLLBACK_ATOMIC":
            return new SQLiteIoerrRollbackAtomic({ message, cause });
        case "SQLITE_IOERR_SEEK":
            return new SQLiteIoerrSeek({ message, cause });
        case "SQLITE_IOERR_SHMLOCK":
            return new SQLiteIoerrShmlock({ message, cause });
        case "SQLITE_IOERR_SHMMAP":
            return new SQLiteIoerrShmmap({ message, cause });
        case "SQLITE_IOERR_SHMOPEN":
            return new SQLiteIoerrShmopen({ message, cause });
        case "SQLITE_IOERR_SHMSIZE":
            return new SQLiteIoerrShmsize({ message, cause });
        case "SQLITE_IOERR_SHORT_READ":
            return new SQLiteIoerrShortRead({ message, cause });
        case "SQLITE_IOERR_TRUNCATE":
            return new SQLiteIoerrTruncate({ message, cause });
        case "SQLITE_IOERR_UNLOCK":
            return new SQLiteIoerrUnlock({ message, cause });
        case "SQLITE_IOERR_VNODE":
            return new SQLiteIoerrVnode({ message, cause });
        case "SQLITE_IOERR_WRITE":
            return new SQLiteIoerrWrite({ message, cause });
        // Extended - LOCKED
        case "SQLITE_LOCKED_SHAREDCACHE":
            return new SQLiteLockedSharedcache({ message, cause });
        case "SQLITE_LOCKED_VTAB":
            return new SQLiteLockedVtab({ message, cause });
        // Extended - NOTICE
        case "SQLITE_NOTICE_RECOVER_ROLLBACK":
            return new SQLiteNoticeRecoverRollback({ message, cause });
        case "SQLITE_NOTICE_RECOVER_WAL":
            return new SQLiteNoticeRecoverWal({ message, cause });
        // Extended - READONLY
        case "SQLITE_READONLY_CANTINIT":
            return new SQLiteReadonlyCantinit({ message, cause });
        case "SQLITE_READONLY_CANTLOCK":
            return new SQLiteReadonlyCantlock({ message, cause });
        case "SQLITE_READONLY_DBMOVED":
            return new SQLiteReadonlyDbmoved({ message, cause });
        case "SQLITE_READONLY_DIRECTORY":
            return new SQLiteReadonlyDirectory({ message, cause });
        case "SQLITE_READONLY_RECOVERY":
            return new SQLiteReadonlyRecovery({ message, cause });
        case "SQLITE_READONLY_ROLLBACK":
            return new SQLiteReadonlyRollback({ message, cause });
        // Extended - WARNING
        case "SQLITE_WARNING_AUTOINDEX":
            return new SQLiteWarningAutoindex({ message, cause });
        // Unknown/default
        default:
            return new SQLiteUnknownError({ message, cause, code });
    }
};
//# sourceMappingURL=SQLiteError.js.map