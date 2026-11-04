/**
 * Root of alchemy's user-level auth state (`~/.alchemy`). Overridable with
 * `ALCHEMY_HOME`, which relocates profiles, credential files,
 * and cross-process locks together — used by tests to isolate a temp home
 * and available to users who keep dotfiles elsewhere. Resolved lazily so an
 * override set after module load (e.g. in a test) still takes effect.
 */
export declare const rootDir: () => string;
export declare const configFilePath: () => string;
/** Directory containing one directory per named profile. */
export declare const profilesDirPath: () => string;
/** Directory containing all provider documents for a named profile. */
export declare const profileDirPath: (profile: string) => string;
/** The single persisted document for one provider in one profile. */
export declare const profileProviderFilePath: (profile: string, provider: string) => string;
export declare const credentialsDirPath: () => string;
export declare const profileCredentialsDirPath: (profile: string) => string;
//# sourceMappingURL=Paths.d.ts.map