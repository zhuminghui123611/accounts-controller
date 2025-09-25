import type { KeyringObject } from "@metamask/keyring-controller";
import { KeyringTypes } from "@metamask/keyring-controller";
import type { InternalAccount } from "@metamask/keyring-internal-api";
import type { Infer } from "@metamask/superstruct";
import type { V4Options } from "uuid";
/**
 * Returns the name of the keyring type.
 *
 * @param keyringType - The type of the keyring.
 * @returns The name of the keyring type.
 */
export declare function keyringTypeToName(keyringType: string): string;
/**
 * Generates a UUID v4 options from a given Ethereum address.
 *
 * @param address - The Ethereum address to generate the UUID from.
 * @returns The UUID v4 options.
 */
export declare function getUUIDOptionsFromAddressOfNormalAccount(address: string): V4Options;
/**
 * Generates a UUID from a given Ethereum address.
 *
 * @param address - The Ethereum address to generate the UUID from.
 * @returns The generated UUID.
 */
export declare function getUUIDFromAddressOfNormalAccount(address: string): string;
/**
 * Check if a keyring type is considered a "normal" keyring.
 *
 * @param keyringType - The account's keyring type.
 * @returns True if the keyring type is considered a "normal" keyring, false otherwise.
 */
export declare function isNormalKeyringType(keyringType: KeyringTypes | string): boolean;
/**
 * Check if a keyring type is a Snap keyring.
 *
 * @param keyringType - The account's keyring type.
 * @returns True if the keyring type is considered a Snap keyring, false otherwise.
 */
export declare function isSnapKeyringType(keyringType: KeyringTypes | string): boolean;
/**
 * Check if a keyring type is a simple keyring.
 *
 * @param keyringType - The account's keyring type.
 * @returns True if the keyring type is considered a simple keyring, false otherwise.
 */
export declare function isSimpleKeyringType(keyringType: KeyringTypes | string): boolean;
/**
 * Check if a keyring is a HD keyring.
 *
 * @param keyringType - The account's keyring type.
 * @returns True if the keyring is a HD keyring, false otherwise.
 */
export declare function isHdKeyringType(keyringType: KeyringTypes | string): boolean;
/**
 * Get the derivation path for the index of an account within a EVM HD keyring.
 *
 * @param index - The account index.
 * @returns The derivation path.
 */
export declare function getEvmDerivationPathForIndex(index: number): string;
/**
 * Get the group index from a keyring object (EVM HD keyring only) and an address.
 *
 * @param keyring - The keyring object.
 * @param address - The address to match.
 * @returns The group index for that address, undefined if not able to match the address.
 */
export declare function getEvmGroupIndexFromAddressIndex(keyring: KeyringObject, address: string): number | undefined;
/**
 * HD keyring account for Snap accounts that handles non-EVM HD accounts. (e.g the
 * Solana Snap).
 *
 * NOTE: We use `superstruct.type` here `superstruct.object` since it allows
 * extra-properties than a Snap might add in its `options`.
 */
export declare const HdSnapKeyringAccountOptionsStruct: import("@metamask/superstruct").Struct<{
    derivationPath: string;
    entropySource: string;
    index: number;
}, {
    entropySource: import("@metamask/superstruct").Struct<string, null>;
    index: import("@metamask/superstruct").Struct<number, null>;
    derivationPath: import("@metamask/superstruct").Struct<string, null>;
}>;
export type HdSnapKeyringAccountOptions = Infer<typeof HdSnapKeyringAccountOptionsStruct>;
/**
 * HD keyring account for Snap accounts that handles non-EVM HD accounts.
 */
export type HdSnapKeyringAccount = InternalAccount & {
    options: InternalAccount['options'] & HdSnapKeyringAccountOptions;
};
/**
 * Check if an account is an HD Snap keyring account.
 *
 * @param account - Snap keyring account.
 * @returns True if valid, false otherwise.
 */
export declare function isHdSnapKeyringAccount(account: InternalAccount): account is HdSnapKeyringAccount;
//# sourceMappingURL=utils.d.cts.map