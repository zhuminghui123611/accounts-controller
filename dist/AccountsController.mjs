var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AccountsController_instances, _AccountsController_assertAccountCanBeRenamed, _AccountsController_getInternalAccountForNonSnapAccount, _AccountsController_getSnapKeyring, _AccountsController_handleOnSnapKeyringAccountEvent, _AccountsController_handleOnKeyringStateChange, _AccountsController_update, _AccountsController_handleOnSnapStateChange, _AccountsController_getAccountsByKeyringType, _AccountsController_getLastSelectedAccount, _AccountsController_getLastSelectedIndex, _AccountsController_getInternalAccountFromAddressAndType, _AccountsController_handleOnMultichainNetworkDidChange, _AccountsController_subscribeToMessageEvents, _AccountsController_registerMessageHandlers;
import { BaseController } from "@metamask/base-controller";
import { SnapKeyring } from "@metamask/eth-snap-keyring";
import { EthAccountType, EthMethod, EthScope, isEvmAccountType, KeyringAccountEntropyTypeOption } from "@metamask/keyring-api";
import { KeyringTypes } from "@metamask/keyring-controller";
import { isScopeEqualToAny } from "@metamask/keyring-utils";
import { isCaipChainId } from "@metamask/utils";
import $lodash from "lodash";
const { cloneDeep } = $lodash;
import { getEvmDerivationPathForIndex, getEvmGroupIndexFromAddressIndex, getUUIDFromAddressOfNormalAccount, isHdKeyringType, isHdSnapKeyringAccount, isSimpleKeyringType, isSnapKeyringType, keyringTypeToName } from "./utils.mjs";
const controllerName = 'AccountsController';
const accountsControllerMetadata = {
    internalAccounts: {
        includeInStateLogs: true,
        persist: true,
        anonymous: false,
        usedInUi: true,
    },
};
const defaultState = {
    internalAccounts: {
        accounts: {},
        selectedAccount: '',
    },
};
export const EMPTY_ACCOUNT = {
    id: '',
    address: '',
    options: {},
    methods: [],
    type: EthAccountType.Eoa,
    scopes: [EthScope.Eoa],
    metadata: {
        name: '',
        keyring: {
            type: '',
        },
        importTime: 0,
    },
};
/**
 * Controller that manages internal accounts.
 * The accounts controller is responsible for creating and managing internal accounts.
 * It also provides convenience methods for accessing and updating the internal accounts.
 * The accounts controller also listens for keyring state changes and updates the internal accounts accordingly.
 * The accounts controller also listens for snap state changes and updates the internal accounts accordingly.
 *
 */
export class AccountsController extends BaseController {
    /**
     * Constructor for AccountsController.
     *
     * @param options - The controller options.
     * @param options.messenger - The messenger object.
     * @param options.state - Initial state to set on this controller
     */
    constructor({ messenger, state, }) {
        super({
            messenger,
            name: controllerName,
            metadata: accountsControllerMetadata,
            state: {
                ...defaultState,
                ...state,
            },
        });
        _AccountsController_instances.add(this);
        __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_subscribeToMessageEvents).call(this);
        __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_registerMessageHandlers).call(this);
    }
    /**
     * Returns the internal account object for the given account ID, if it exists.
     *
     * @param accountId - The ID of the account to retrieve.
     * @returns The internal account object, or undefined if the account does not exist.
     */
    getAccount(accountId) {
        return this.state.internalAccounts.accounts[accountId];
    }
    /**
     * Returns an array of all evm internal accounts.
     *
     * @returns An array of InternalAccount objects.
     */
    listAccounts() {
        const accounts = Object.values(this.state.internalAccounts.accounts);
        return accounts.filter((account) => isEvmAccountType(account.type));
    }
    /**
     * Returns an array of all internal accounts.
     *
     * @param chainId - The chain ID.
     * @returns An array of InternalAccount objects.
     */
    listMultichainAccounts(chainId) {
        const accounts = Object.values(this.state.internalAccounts.accounts);
        if (!chainId) {
            return accounts;
        }
        if (!isCaipChainId(chainId)) {
            throw new Error(`Invalid CAIP-2 chain ID: ${String(chainId)}`);
        }
        return accounts.filter((account) => isScopeEqualToAny(chainId, account.scopes));
    }
    /**
     * Returns the internal account object for the given account ID.
     *
     * @param accountId - The ID of the account to retrieve.
     * @returns The internal account object.
     * @throws An error if the account ID is not found.
     */
    getAccountExpect(accountId) {
        const account = this.getAccount(accountId);
        if (account === undefined) {
            throw new Error(`Account Id "${accountId}" not found`);
        }
        return account;
    }
    /**
     * Returns the last selected EVM account.
     *
     * @returns The selected internal account.
     */
    getSelectedAccount() {
        const { internalAccounts: { selectedAccount }, } = this.state;
        // Edge case where the extension is setup but the srp is not yet created
        // certain ui elements will query the selected address before any accounts are created.
        if (selectedAccount === '') {
            return EMPTY_ACCOUNT;
        }
        const account = this.getAccountExpect(selectedAccount);
        if (isEvmAccountType(account.type)) {
            return account;
        }
        const accounts = this.listAccounts();
        if (!accounts.length) {
            // ! Should never reach this.
            throw new Error('No EVM accounts');
        }
        // This will never be undefined because we have already checked if accounts.length is > 0
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_getLastSelectedAccount).call(this, accounts);
    }
    /**
     * __WARNING The return value may be undefined if there isn't an account for that chain id.__
     *
     * Retrieves the last selected account by chain ID.
     *
     * @param chainId - The chain ID to filter the accounts.
     * @returns The last selected account compatible with the specified chain ID or undefined.
     */
    getSelectedMultichainAccount(chainId) {
        const { internalAccounts: { selectedAccount }, } = this.state;
        // Edge case where the extension is setup but the srp is not yet created
        // certain ui elements will query the selected address before any accounts are created.
        if (selectedAccount === '') {
            return EMPTY_ACCOUNT;
        }
        if (!chainId) {
            return this.getAccountExpect(selectedAccount);
        }
        const accounts = this.listMultichainAccounts(chainId);
        return __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_getLastSelectedAccount).call(this, accounts);
    }
    /**
     * Returns the account with the specified address.
     * ! This method will only return the first account that matches the address
     *
     * @param address - The address of the account to retrieve.
     * @returns The account with the specified address, or undefined if not found.
     */
    getAccountByAddress(address) {
        return this.listMultichainAccounts().find((account) => account.address.toLowerCase() === address.toLowerCase());
    }
    /**
     * Sets the selected account by its ID.
     *
     * @param accountId - The ID of the account to be selected.
     */
    setSelectedAccount(accountId) {
        const account = this.getAccountExpect(accountId);
        if (this.state.internalAccounts.selectedAccount === account.id) {
            return;
        }
        __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_update).call(this, (state) => {
            const { internalAccounts } = state;
            internalAccounts.accounts[account.id].metadata.lastSelected = Date.now();
            internalAccounts.selectedAccount = account.id;
        });
    }
    /**
     * Sets the name of the account with the given ID.
     *
     * @param accountId - The ID of the account to set the name for.
     * @param accountName - The new name for the account.
     * @throws An error if an account with the same name already exists.
     */
    setAccountName(accountId, accountName) {
        // This will check for name uniqueness and fire the `accountRenamed` event
        // if the account has been renamed.
        this.updateAccountMetadata(accountId, {
            name: accountName,
            nameLastUpdatedAt: Date.now(),
        });
    }
    /**
     * Sets the name of the account with the given ID and select it.
     *
     * @param accountId - The ID of the account to set the name for and select.
     * @param accountName - The new name for the account.
     * @throws An error if an account with the same name already exists.
     */
    setAccountNameAndSelectAccount(accountId, accountName) {
        const account = this.getAccountExpect(accountId);
        __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_assertAccountCanBeRenamed).call(this, account, accountName);
        const internalAccount = {
            ...account,
            metadata: {
                ...account.metadata,
                name: accountName,
                nameLastUpdatedAt: Date.now(),
                lastSelected: __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_getLastSelectedIndex).call(this),
            },
        };
        __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_update).call(this, (state) => {
            state.internalAccounts.accounts[account.id] = internalAccount;
            state.internalAccounts.selectedAccount = account.id;
        });
        this.messagingSystem.publish('AccountsController:accountRenamed', internalAccount);
    }
    /**
     * Updates the metadata of the account with the given ID.
     *
     * @param accountId - The ID of the account for which the metadata will be updated.
     * @param metadata - The new metadata for the account.
     */
    updateAccountMetadata(accountId, metadata) {
        const account = this.getAccountExpect(accountId);
        if (metadata.name) {
            __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_assertAccountCanBeRenamed).call(this, account, metadata.name);
        }
        const internalAccount = {
            ...account,
            metadata: { ...account.metadata, ...metadata },
        };
        __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_update).call(this, (state) => {
            state.internalAccounts.accounts[accountId] = internalAccount;
        });
        if (metadata.name) {
            this.messagingSystem.publish('AccountsController:accountRenamed', internalAccount);
        }
    }
    /**
     * Updates the internal accounts list by retrieving normal and snap accounts,
     * removing duplicates, and updating the metadata of each account.
     *
     * @returns A Promise that resolves when the accounts have been updated.
     */
    async updateAccounts() {
        const keyringAccountIndexes = new Map();
        const existingInternalAccounts = this.state.internalAccounts.accounts;
        const internalAccounts = {};
        const { keyrings } = this.messagingSystem.call('KeyringController:getState');
        for (const keyring of keyrings) {
            const keyringTypeName = keyringTypeToName(keyring.type);
            for (const address of keyring.accounts) {
                const internalAccount = __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_getInternalAccountFromAddressAndType).call(this, address, keyring);
                // This should never really happen, but if for some reason we're not
                // able to get the Snap keyring reference, this would return an
                // undefined account.
                // So we just skip it, even though, this should not really happen.
                if (!internalAccount) {
                    continue;
                }
                // Get current index for this keyring (we use human indexing, so start at 1).
                const keyringAccountIndex = keyringAccountIndexes.get(keyringTypeName) ?? 1;
                const existingAccount = existingInternalAccounts[internalAccount.id];
                internalAccounts[internalAccount.id] = {
                    ...internalAccount,
                    metadata: {
                        ...internalAccount.metadata,
                        // Re-use existing metadata if any.
                        name: existingAccount?.metadata.name ??
                            `${keyringTypeName} ${keyringAccountIndex}`,
                        importTime: existingAccount?.metadata.importTime ?? Date.now(),
                        lastSelected: existingAccount?.metadata.lastSelected ?? 0,
                    },
                };
                // Increment the account index for this keyring.
                keyringAccountIndexes.set(keyringTypeName, keyringAccountIndex + 1);
            }
        }
        __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_update).call(this, (state) => {
            state.internalAccounts.accounts = internalAccounts;
        });
    }
    /**
     * Loads the backup state of the accounts controller.
     *
     * @param backup - The backup state to load.
     */
    loadBackup(backup) {
        if (backup.internalAccounts) {
            this.update((currentState) => {
                currentState.internalAccounts = backup.internalAccounts;
            });
        }
    }
    /**
     * Returns the next account number for a given keyring type.
     *
     * @param keyringType - The type of keyring.
     * @param accounts - Existing accounts to check for the next available account number.
     * @returns An object containing the account prefix and index to use.
     */
    getNextAvailableAccountName(keyringType = KeyringTypes.hd, accounts) {
        const keyringName = keyringTypeToName(keyringType);
        const keyringAccounts = __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_getAccountsByKeyringType).call(this, keyringType, accounts);
        const lastDefaultIndexUsedForKeyringType = keyringAccounts.reduce((maxInternalAccountIndex, internalAccount) => {
            // We **DO NOT USE** `\d+` here to only consider valid "human"
            // number (rounded decimal number)
            const match = new RegExp(`${keyringName} ([0-9]+)$`, 'u').exec(internalAccount.metadata.name);
            if (match) {
                // Quoting `RegExp.exec` documentation:
                // > The returned array has the matched text as the first item, and then one item for
                // > each capturing group of the matched text.
                // So use `match[1]` to get the captured value
                const internalAccountIndex = parseInt(match[1], 10);
                return Math.max(maxInternalAccountIndex, internalAccountIndex);
            }
            return maxInternalAccountIndex;
        }, 0);
        const index = Math.max(keyringAccounts.length + 1, lastDefaultIndexUsedForKeyringType + 1);
        return `${keyringName} ${index}`;
    }
}
_AccountsController_instances = new WeakSet(), _AccountsController_assertAccountCanBeRenamed = function _AccountsController_assertAccountCanBeRenamed(account, accountName) {
    if (this.listMultichainAccounts().find((internalAccount) => internalAccount.metadata.name === accountName &&
        internalAccount.id !== account.id)) {
        throw new Error('Account name already exists');
    }
}, _AccountsController_getInternalAccountForNonSnapAccount = function _AccountsController_getInternalAccountForNonSnapAccount(address, keyring) {
    const id = getUUIDFromAddressOfNormalAccount(address);
    // We might have an account for this ID already, so we'll just re-use
    // the same metadata
    const account = this.getAccount(id);
    const metadata = {
        name: account?.metadata.name ?? '',
        ...(account?.metadata.nameLastUpdatedAt
            ? {
                nameLastUpdatedAt: account?.metadata.nameLastUpdatedAt,
            }
            : {}),
        importTime: account?.metadata.importTime ?? Date.now(),
        lastSelected: account?.metadata.lastSelected ?? 0,
        keyring: {
            type: keyring.type,
        },
    };
    let options = {};
    if (isHdKeyringType(keyring.type)) {
        // We need to find the account index from its HD keyring.
        const groupIndex = getEvmGroupIndexFromAddressIndex(keyring, address);
        // If for some reason, we cannot find this address, then the caller made a mistake
        // and it did not use the proper keyring object. For now, we do not fail and just
        // consider this account as "simple account".
        if (groupIndex !== undefined) {
            // NOTE: We are not using the `hdPath` from the associated keyring here and
            // getting the keyring instance here feels a bit overkill.
            // This will be naturally fixed once every keyring start using `KeyringAccount` and implement the keyring API.
            const derivationPath = getEvmDerivationPathForIndex(groupIndex);
            // Those are "legacy options" and they were used before `KeyringAccount` added
            // support for type options. We keep those temporarily until we update everything
            // to use the new typed options.
            const legacyOptions = {
                entropySource: keyring.metadata.id,
                derivationPath,
                groupIndex,
            };
            // New typed entropy options. This is required for multichain accounts.
            const entropyOptions = {
                entropy: {
                    type: KeyringAccountEntropyTypeOption.Mnemonic,
                    id: keyring.metadata.id,
                    derivationPath,
                    groupIndex,
                },
            };
            options = {
                ...legacyOptions,
                ...entropyOptions,
            };
        }
    }
    return {
        id,
        address,
        options,
        methods: [
            EthMethod.PersonalSign,
            EthMethod.Sign,
            EthMethod.SignTransaction,
            EthMethod.SignTypedDataV1,
            EthMethod.SignTypedDataV3,
            EthMethod.SignTypedDataV4,
        ],
        scopes: [EthScope.Eoa],
        type: EthAccountType.Eoa,
        metadata,
    };
}, _AccountsController_getSnapKeyring = function _AccountsController_getSnapKeyring() {
    const [snapKeyring] = this.messagingSystem.call('KeyringController:getKeyringsByType', SnapKeyring.type);
    // Snap keyring is not available until the first account is created in the keyring
    // controller, so this might be undefined.
    return snapKeyring;
}, _AccountsController_handleOnSnapKeyringAccountEvent = function _AccountsController_handleOnSnapKeyringAccountEvent(event, ...payload) {
    this.messagingSystem.publish(event, ...payload);
}, _AccountsController_handleOnKeyringStateChange = function _AccountsController_handleOnKeyringStateChange({ isUnlocked, keyrings, }) {
    // TODO: Change when accountAdded event is added to the keyring controller.
    // We check for keyrings length to be greater than 0 because the extension client may try execute
    // submit password twice and clear the keyring state.
    // https://github.com/MetaMask/KeyringController/blob/2d73a4deed8d013913f6ef0c9f5c0bb7c614f7d3/src/KeyringController.ts#L910
    if (!isUnlocked || keyrings.length === 0) {
        return;
    }
    // State patches.
    const generatePatch = () => {
        return {
            previous: {},
            added: [],
            updated: [],
            removed: [],
        };
    };
    const patches = {
        snap: generatePatch(),
        normal: generatePatch(),
    };
    // Gets the patch object based on the keyring type (since Snap accounts and other accounts
    // are handled differently).
    const patchOf = (type) => {
        if (isSnapKeyringType(type)) {
            return patches.snap;
        }
        return patches.normal;
    };
    // Create a map (with lower-cased addresses) of all existing accounts.
    for (const account of this.listMultichainAccounts()) {
        const address = account.address.toLowerCase();
        const patch = patchOf(account.metadata.keyring.type);
        patch.previous[address] = account;
    }
    // Go over all keyring changes and create patches out of it.
    const addresses = new Set();
    for (const keyring of keyrings) {
        const patch = patchOf(keyring.type);
        for (const accountAddress of keyring.accounts) {
            // Lower-case address to use it in the `previous` map.
            const address = accountAddress.toLowerCase();
            const account = patch.previous[address];
            if (account) {
                // If the account exists before, this might be an update.
                patch.updated.push(account);
            }
            else {
                // Otherwise, that's a new account.
                patch.added.push({
                    address,
                    keyring,
                });
            }
            // Keep track of those address to check for removed accounts later.
            addresses.add(address);
        }
    }
    // We might have accounts associated with removed keyrings, so we iterate
    // over all previous known accounts and check against the keyring addresses.
    for (const patch of [patches.snap, patches.normal]) {
        for (const [address, account] of Object.entries(patch.previous)) {
            // If a previous address is not part of the new addesses, then it got removed.
            if (!addresses.has(address)) {
                patch.removed.push(account);
            }
        }
    }
    // Diff that we will use to publish events afterward.
    const diff = {
        removed: [],
        added: [],
    };
    __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_update).call(this, (state) => {
        const { internalAccounts } = state;
        for (const patch of [patches.snap, patches.normal]) {
            for (const account of patch.removed) {
                delete internalAccounts.accounts[account.id];
                diff.removed.push(account.id);
            }
            for (const added of patch.added) {
                const account = __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_getInternalAccountFromAddressAndType).call(this, added.address, added.keyring);
                if (account) {
                    // Re-compute the list of accounts everytime, so we can make sure new names
                    // are also considered.
                    const accounts = Object.values(internalAccounts.accounts);
                    // Get next account name available for this given keyring.
                    const name = this.getNextAvailableAccountName(account.metadata.keyring.type, accounts);
                    // If it's the first account, we need to select it.
                    const lastSelected = accounts.length === 0 ? __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_getLastSelectedIndex).call(this) : 0;
                    internalAccounts.accounts[account.id] = {
                        ...account,
                        metadata: {
                            ...account.metadata,
                            name,
                            importTime: Date.now(),
                            lastSelected,
                        },
                    };
                    diff.added.push(internalAccounts.accounts[account.id]);
                }
            }
        }
    }, 
    // Will get executed after the update, but before re-selecting an account in case
    // the current one is not valid anymore.
    () => {
        // Now publish events
        for (const id of diff.removed) {
            this.messagingSystem.publish('AccountsController:accountRemoved', id);
        }
        for (const account of diff.added) {
            this.messagingSystem.publish('AccountsController:accountAdded', account);
        }
    });
    // NOTE: Since we also track "updated" accounts with our patches, we could fire a new event
    // like `accountUpdated` (we would still need to check if anything really changed on the account).
}, _AccountsController_update = function _AccountsController_update(callback, beforeAutoSelectAccount) {
    // The currently selected account might get deleted during the update, so keep track
    // of it before doing any change.
    const previouslySelectedAccount = this.state.internalAccounts.selectedAccount;
    this.update((state) => {
        callback(state);
        // If the account no longer exists (or none is selected), we need to re-select another one.
        const { internalAccounts } = state;
        if (!internalAccounts.accounts[previouslySelectedAccount]) {
            const accounts = Object.values(internalAccounts.accounts);
            // Get the lastly selected account (according to the current accounts).
            const lastSelectedAccount = __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_getLastSelectedAccount).call(this, accounts);
            if (lastSelectedAccount) {
                internalAccounts.selectedAccount = lastSelectedAccount.id;
                internalAccounts.accounts[lastSelectedAccount.id].metadata.lastSelected = __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_getLastSelectedIndex).call(this);
            }
            else {
                // It will be undefined if there are no accounts.
                internalAccounts.selectedAccount = '';
            }
        }
    });
    // We might want to do some pre-work before selecting a new account.
    beforeAutoSelectAccount?.();
    // Now, we compare the newly selected account, and we send event if different.
    const { selectedAccount } = this.state.internalAccounts;
    if (selectedAccount && selectedAccount !== previouslySelectedAccount) {
        const account = this.getSelectedMultichainAccount();
        // The account should always be defined at this point, since we have already checked for
        // `selectedAccount` to be non-empty.
        if (account) {
            if (isEvmAccountType(account.type)) {
                this.messagingSystem.publish('AccountsController:selectedEvmAccountChange', account);
            }
            this.messagingSystem.publish('AccountsController:selectedAccountChange', account);
        }
    }
}, _AccountsController_handleOnSnapStateChange = function _AccountsController_handleOnSnapStateChange(snapState) {
    // Only check if Snaps changed in status.
    const { snaps } = snapState;
    const accounts = [];
    for (const account of this.listMultichainAccounts()) {
        if (account.metadata.snap) {
            const snap = snaps[account.metadata.snap.id];
            if (snap) {
                const enabled = snap.enabled && !snap.blocked;
                const metadata = account.metadata.snap;
                if (metadata.enabled !== enabled) {
                    accounts.push({ id: account.id, enabled });
                }
            }
            else {
                // If Snap could not be found on the state, we consider it disabled.
                accounts.push({ id: account.id, enabled: false });
            }
        }
    }
    if (accounts.length > 0) {
        this.update((state) => {
            for (const { id, enabled } of accounts) {
                const account = state.internalAccounts.accounts[id];
                if (account.metadata.snap) {
                    account.metadata.snap.enabled = enabled;
                }
            }
        });
    }
}, _AccountsController_getAccountsByKeyringType = function _AccountsController_getAccountsByKeyringType(keyringType, accounts) {
    return (accounts ?? this.listMultichainAccounts()).filter((internalAccount) => {
        // We do consider `hd` and `simple` keyrings to be of same type. So we check those 2 types
        // to group those accounts together!
        if (isHdKeyringType(keyringType) || isSimpleKeyringType(keyringType)) {
            return (isHdKeyringType(internalAccount.metadata.keyring.type) ||
                isSimpleKeyringType(internalAccount.metadata.keyring.type));
        }
        return internalAccount.metadata.keyring.type === keyringType;
    });
}, _AccountsController_getLastSelectedAccount = function _AccountsController_getLastSelectedAccount(accounts) {
    const [accountToSelect] = accounts.sort((accountA, accountB) => {
        // sort by lastSelected descending
        return ((accountB.metadata.lastSelected ?? 0) -
            (accountA.metadata.lastSelected ?? 0));
    });
    return accountToSelect;
}, _AccountsController_getLastSelectedIndex = function _AccountsController_getLastSelectedIndex() {
    // NOTE: For now we use the current date, since we know this value
    // will always be higher than any already selected account index.
    return Date.now();
}, _AccountsController_getInternalAccountFromAddressAndType = function _AccountsController_getInternalAccountFromAddressAndType(address, keyring) {
    if (isSnapKeyringType(keyring.type)) {
        const snapKeyring = __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_getSnapKeyring).call(this);
        // We need the Snap keyring to retrieve the account from its address.
        if (!snapKeyring) {
            return undefined;
        }
        // This might be undefined if the Snap deleted the account before
        // reaching that point.
        let account = snapKeyring.getAccountByAddress(address);
        if (account) {
            // We force the copy here, to avoid mutating the reference returned by the Snap keyring.
            account = cloneDeep(account);
            // MIGRATION: To avoid any existing Snap account migration, we are
            // just "adding" the new typed options that we need for multichain
            // accounts. Ultimately, we would need a real Snap account migrations
            // (being handled by each Snaps).
            if (isHdSnapKeyringAccount(account)) {
                const options = {
                    ...account.options,
                    entropy: {
                        type: KeyringAccountEntropyTypeOption.Mnemonic,
                        id: account.options.entropySource,
                        groupIndex: account.options.index,
                        derivationPath: account.options.derivationPath,
                    },
                };
                // Inject the new typed options to the internal account copy.
                account.options = options;
            }
        }
        return account;
    }
    return __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_getInternalAccountForNonSnapAccount).call(this, address, keyring);
}, _AccountsController_handleOnMultichainNetworkDidChange = function _AccountsController_handleOnMultichainNetworkDidChange(id) {
    let accountId;
    // We only support non-EVM Caip chain IDs at the moment. Ex Solana and Bitcoin
    // MultichainNetworkController will handle throwing an error if the Caip chain ID is not supported
    if (isCaipChainId(id)) {
        // Update selected account to non evm account
        const lastSelectedNonEvmAccount = this.getSelectedMultichainAccount(id);
        // @ts-expect-error - This should never be undefined, otherwise it's a bug that should be handled
        accountId = lastSelectedNonEvmAccount.id;
    }
    else {
        // Update selected account to evm account
        const lastSelectedEvmAccount = this.getSelectedAccount();
        accountId = lastSelectedEvmAccount.id;
    }
    if (this.state.internalAccounts.selectedAccount === accountId) {
        return;
    }
    this.update((currentState) => {
        currentState.internalAccounts.accounts[accountId].metadata.lastSelected =
            Date.now();
        currentState.internalAccounts.selectedAccount = accountId;
    });
    // DO NOT publish AccountsController:setSelectedAccount to prevent circular listener loops
}, _AccountsController_subscribeToMessageEvents = function _AccountsController_subscribeToMessageEvents() {
    this.messagingSystem.subscribe('SnapController:stateChange', (snapStateState) => __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_handleOnSnapStateChange).call(this, snapStateState));
    this.messagingSystem.subscribe('KeyringController:stateChange', (keyringState) => __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_handleOnKeyringStateChange).call(this, keyringState));
    this.messagingSystem.subscribe('SnapKeyring:accountAssetListUpdated', (snapAccountEvent) => __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_handleOnSnapKeyringAccountEvent).call(this, 'AccountsController:accountAssetListUpdated', snapAccountEvent));
    this.messagingSystem.subscribe('SnapKeyring:accountBalancesUpdated', (snapAccountEvent) => __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_handleOnSnapKeyringAccountEvent).call(this, 'AccountsController:accountBalancesUpdated', snapAccountEvent));
    this.messagingSystem.subscribe('SnapKeyring:accountTransactionsUpdated', (snapAccountEvent) => __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_handleOnSnapKeyringAccountEvent).call(this, 'AccountsController:accountTransactionsUpdated', snapAccountEvent));
    // Handle account change when multichain network is changed
    this.messagingSystem.subscribe('MultichainNetworkController:networkDidChange', (id) => __classPrivateFieldGet(this, _AccountsController_instances, "m", _AccountsController_handleOnMultichainNetworkDidChange).call(this, id));
}, _AccountsController_registerMessageHandlers = function _AccountsController_registerMessageHandlers() {
    this.messagingSystem.registerActionHandler(`${controllerName}:setSelectedAccount`, this.setSelectedAccount.bind(this));
    this.messagingSystem.registerActionHandler(`${controllerName}:listAccounts`, this.listAccounts.bind(this));
    this.messagingSystem.registerActionHandler(`${controllerName}:listMultichainAccounts`, this.listMultichainAccounts.bind(this));
    this.messagingSystem.registerActionHandler(`${controllerName}:setAccountName`, this.setAccountName.bind(this));
    this.messagingSystem.registerActionHandler(`${controllerName}:setAccountNameAndSelectAccount`, this.setAccountNameAndSelectAccount.bind(this));
    this.messagingSystem.registerActionHandler(`${controllerName}:updateAccounts`, this.updateAccounts.bind(this));
    this.messagingSystem.registerActionHandler(`${controllerName}:getSelectedAccount`, this.getSelectedAccount.bind(this));
    this.messagingSystem.registerActionHandler(`${controllerName}:getSelectedMultichainAccount`, this.getSelectedMultichainAccount.bind(this));
    this.messagingSystem.registerActionHandler(`${controllerName}:getAccountByAddress`, this.getAccountByAddress.bind(this));
    this.messagingSystem.registerActionHandler(`${controllerName}:getNextAvailableAccountName`, this.getNextAvailableAccountName.bind(this));
    this.messagingSystem.registerActionHandler(`AccountsController:getAccount`, this.getAccount.bind(this));
    this.messagingSystem.registerActionHandler(`AccountsController:updateAccountMetadata`, this.updateAccountMetadata.bind(this));
};
//# sourceMappingURL=AccountsController.mjs.map