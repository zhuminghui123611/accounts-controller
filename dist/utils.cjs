"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHdSnapKeyringAccount = exports.HdSnapKeyringAccountOptionsStruct = exports.getEvmGroupIndexFromAddressIndex = exports.getEvmDerivationPathForIndex = exports.isHdKeyringType = exports.isSimpleKeyringType = exports.isSnapKeyringType = exports.isNormalKeyringType = exports.getUUIDFromAddressOfNormalAccount = exports.getUUIDOptionsFromAddressOfNormalAccount = exports.keyringTypeToName = void 0;
const keyring_controller_1 = require("@metamask/keyring-controller");
const superstruct_1 = require("@metamask/superstruct");
const utils_1 = require("@metamask/utils");
const sha256_1 = require("ethereum-cryptography/sha256");
const uuid_1 = require("uuid");
/**
 * Returns the name of the keyring type.
 *
 * @param keyringType - The type of the keyring.
 * @returns The name of the keyring type.
 */
function keyringTypeToName(keyringType) {
    switch (keyringType) {
        case keyring_controller_1.KeyringTypes.simple: {
            return 'Account';
        }
        case keyring_controller_1.KeyringTypes.hd: {
            return 'Account';
        }
        case keyring_controller_1.KeyringTypes.trezor: {
            return 'Trezor';
        }
        case keyring_controller_1.KeyringTypes.oneKey: {
            return 'OneKey';
        }
        case keyring_controller_1.KeyringTypes.ledger: {
            return 'Ledger';
        }
        case keyring_controller_1.KeyringTypes.lattice: {
            return 'Lattice';
        }
        case keyring_controller_1.KeyringTypes.qr: {
            return 'QR';
        }
        case keyring_controller_1.KeyringTypes.snap: {
            return 'Snap Account';
        }
        default: {
            throw new Error(`Unknown keyring ${keyringType}`);
        }
    }
}
exports.keyringTypeToName = keyringTypeToName;
/**
 * Generates a UUID v4 options from a given Ethereum address.
 *
 * @param address - The Ethereum address to generate the UUID from.
 * @returns The UUID v4 options.
 */
function getUUIDOptionsFromAddressOfNormalAccount(address) {
    const v4options = {
        random: (0, sha256_1.sha256)((0, utils_1.hexToBytes)(address)).slice(0, 16),
    };
    return v4options;
}
exports.getUUIDOptionsFromAddressOfNormalAccount = getUUIDOptionsFromAddressOfNormalAccount;
/**
 * Generates a UUID from a given Ethereum address.
 *
 * @param address - The Ethereum address to generate the UUID from.
 * @returns The generated UUID.
 */
function getUUIDFromAddressOfNormalAccount(address) {
    return (0, uuid_1.v4)(getUUIDOptionsFromAddressOfNormalAccount(address));
}
exports.getUUIDFromAddressOfNormalAccount = getUUIDFromAddressOfNormalAccount;
/**
 * Check if a keyring type is considered a "normal" keyring.
 *
 * @param keyringType - The account's keyring type.
 * @returns True if the keyring type is considered a "normal" keyring, false otherwise.
 */
function isNormalKeyringType(keyringType) {
    // Right now, we only have to "exclude" Snap accounts, but this might need to be
    // adapted later on if we have new kind of keyrings!
    return keyringType !== keyring_controller_1.KeyringTypes.snap;
}
exports.isNormalKeyringType = isNormalKeyringType;
/**
 * Check if a keyring type is a Snap keyring.
 *
 * @param keyringType - The account's keyring type.
 * @returns True if the keyring type is considered a Snap keyring, false otherwise.
 */
function isSnapKeyringType(keyringType) {
    return keyringType === keyring_controller_1.KeyringTypes.snap;
}
exports.isSnapKeyringType = isSnapKeyringType;
/**
 * Check if a keyring type is a simple keyring.
 *
 * @param keyringType - The account's keyring type.
 * @returns True if the keyring type is considered a simple keyring, false otherwise.
 */
function isSimpleKeyringType(keyringType) {
    return keyringType === keyring_controller_1.KeyringTypes.simple;
}
exports.isSimpleKeyringType = isSimpleKeyringType;
/**
 * Check if a keyring is a HD keyring.
 *
 * @param keyringType - The account's keyring type.
 * @returns True if the keyring is a HD keyring, false otherwise.
 */
function isHdKeyringType(keyringType) {
    return keyringType === keyring_controller_1.KeyringTypes.hd;
}
exports.isHdKeyringType = isHdKeyringType;
/**
 * Get the derivation path for the index of an account within a EVM HD keyring.
 *
 * @param index - The account index.
 * @returns The derivation path.
 */
function getEvmDerivationPathForIndex(index) {
    const purpose = '44';
    const coinType = '60'; // Ethereum.
    return `m/${purpose}'/${coinType}'/0'/0/${index}`;
}
exports.getEvmDerivationPathForIndex = getEvmDerivationPathForIndex;
/**
 * Get the group index from a keyring object (EVM HD keyring only) and an address.
 *
 * @param keyring - The keyring object.
 * @param address - The address to match.
 * @returns The group index for that address, undefined if not able to match the address.
 */
function getEvmGroupIndexFromAddressIndex(keyring, address) {
    // TODO: Remove this function once EVM HD keyrings start using the new unified
    // keyring API.
    // NOTE: We mostly put that logic in a separate function so we can easily add coverage
    // for (supposedly) unreachable code path.
    if (!isHdKeyringType(keyring.type)) {
        // We cannot extract the group index from non-HD keyrings.
        return undefined;
    }
    // We need to find the account index from its HD keyring. We assume those
    // accounts are ordered, thus we can use their index to compute their
    // derivation path and group index.
    const groupIndex = keyring.accounts.findIndex(
    // NOTE: This is ok to use `toLowerCase` here, since we're only dealing
    // with EVM addresses.
    (accountAddress) => accountAddress.toLowerCase() === address.toLowerCase());
    // If for some reason, we cannot find this address, then the caller made a mistake
    // and it did not use the proper keyring object. For now, we do not fail and just
    // consider this account as "simple account".
    if (groupIndex === -1) {
        console.warn(`! Unable to get group index for HD account: "${address}"`);
        return undefined;
    }
    return groupIndex;
}
exports.getEvmGroupIndexFromAddressIndex = getEvmGroupIndexFromAddressIndex;
/**
 * HD keyring account for Snap accounts that handles non-EVM HD accounts. (e.g the
 * Solana Snap).
 *
 * NOTE: We use `superstruct.type` here `superstruct.object` since it allows
 * extra-properties than a Snap might add in its `options`.
 */
exports.HdSnapKeyringAccountOptionsStruct = (0, superstruct_1.type)({
    entropySource: (0, superstruct_1.string)(),
    index: (0, superstruct_1.number)(),
    derivationPath: (0, superstruct_1.string)(),
});
/**
 * Check if an account is an HD Snap keyring account.
 *
 * @param account - Snap keyring account.
 * @returns True if valid, false otherwise.
 */
function isHdSnapKeyringAccount(account) {
    return (0, superstruct_1.is)(account.options, exports.HdSnapKeyringAccountOptionsStruct);
}
exports.isHdSnapKeyringAccount = isHdSnapKeyringAccount;
//# sourceMappingURL=utils.cjs.map