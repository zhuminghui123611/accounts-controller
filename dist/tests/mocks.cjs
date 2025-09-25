"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockInternalAccountOptions = exports.createExpectedInternalAccount = exports.createMockInternalAccount = exports.ETH_ERC_4337_METHODS = exports.ETH_EOA_METHODS = void 0;
const keyring_api_1 = require("@metamask/keyring-api");
const keyring_controller_1 = require("@metamask/keyring-controller");
const uuid_1 = require("uuid");
exports.ETH_EOA_METHODS = [
    keyring_api_1.EthMethod.PersonalSign,
    keyring_api_1.EthMethod.Sign,
    keyring_api_1.EthMethod.SignTransaction,
    keyring_api_1.EthMethod.SignTypedDataV1,
    keyring_api_1.EthMethod.SignTypedDataV3,
    keyring_api_1.EthMethod.SignTypedDataV4,
];
exports.ETH_ERC_4337_METHODS = [
    keyring_api_1.EthMethod.PatchUserOperation,
    keyring_api_1.EthMethod.PrepareUserOperation,
    keyring_api_1.EthMethod.SignUserOperation,
];
const createMockInternalAccount = ({ id = (0, uuid_1.v4)(), address = '0x2990079bcdee240329a520d2444386fc119da21a', type = keyring_api_1.EthAccountType.Eoa, name = 'Account 1', keyringType = keyring_controller_1.KeyringTypes.hd, snap, methods, scopes, importTime = Date.now(), lastSelected = Date.now(), options, } = {}) => {
    const getInternalAccountDefaults = () => {
        switch (type) {
            case `${keyring_api_1.EthAccountType.Eoa}`:
                return {
                    methods: [...Object.values(exports.ETH_EOA_METHODS)],
                    scopes: [keyring_api_1.EthScope.Eoa],
                };
            case `${keyring_api_1.EthAccountType.Erc4337}`:
                return {
                    methods: [...Object.values(exports.ETH_ERC_4337_METHODS)],
                    scopes: [keyring_api_1.EthScope.Mainnet], // Assuming we are using mainnet for those Smart Accounts.
                };
            case `${keyring_api_1.BtcAccountType.P2wpkh}`:
                return {
                    methods: [...Object.values(keyring_api_1.BtcMethod)],
                    scopes: [keyring_api_1.BtcScope.Mainnet],
                };
            default:
                throw new Error(`Unknown account type: ${type}`);
        }
    };
    const defaults = getInternalAccountDefaults();
    return {
        id,
        address,
        options: options ?? {},
        methods: methods ?? defaults.methods,
        scopes: scopes ?? defaults.scopes,
        type,
        metadata: {
            name,
            keyring: { type: keyringType },
            importTime,
            lastSelected,
            // Use spread operator, to avoid having a `snap: undefined` if not defined.
            ...(snap ? { snap } : {}),
        },
    };
};
exports.createMockInternalAccount = createMockInternalAccount;
const createExpectedInternalAccount = (args) => {
    return (0, exports.createMockInternalAccount)({
        ...args,
        importTime: expect.any(Number),
        lastSelected: expect.any(Number),
    });
};
exports.createExpectedInternalAccount = createExpectedInternalAccount;
const createMockInternalAccountOptions = (keyringIndex, keyringType, groupIndex) => {
    if (keyringType === keyring_controller_1.KeyringTypes.hd) {
        const entropySource = `mock-keyring-id-${keyringIndex}`;
        const derivationPath = `m/44'/60'/0'/0/${groupIndex}`;
        return {
            entropySource,
            derivationPath,
            groupIndex,
            // New `KeyringAccount` typed options:
            entropy: {
                type: keyring_api_1.KeyringAccountEntropyTypeOption.Mnemonic,
                id: entropySource,
                derivationPath,
                groupIndex,
            },
        };
    }
    return {};
};
exports.createMockInternalAccountOptions = createMockInternalAccountOptions;
//# sourceMappingURL=mocks.cjs.map