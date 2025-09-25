import { BtcAccountType, EthAccountType, BtcMethod, EthMethod, EthScope, BtcScope, KeyringAccountEntropyTypeOption } from "@metamask/keyring-api";
import { KeyringTypes } from "@metamask/keyring-controller";
import { v4 } from "uuid";
export const ETH_EOA_METHODS = [
    EthMethod.PersonalSign,
    EthMethod.Sign,
    EthMethod.SignTransaction,
    EthMethod.SignTypedDataV1,
    EthMethod.SignTypedDataV3,
    EthMethod.SignTypedDataV4,
];
export const ETH_ERC_4337_METHODS = [
    EthMethod.PatchUserOperation,
    EthMethod.PrepareUserOperation,
    EthMethod.SignUserOperation,
];
export const createMockInternalAccount = ({ id = v4(), address = '0x2990079bcdee240329a520d2444386fc119da21a', type = EthAccountType.Eoa, name = 'Account 1', keyringType = KeyringTypes.hd, snap, methods, scopes, importTime = Date.now(), lastSelected = Date.now(), options, } = {}) => {
    const getInternalAccountDefaults = () => {
        switch (type) {
            case `${EthAccountType.Eoa}`:
                return {
                    methods: [...Object.values(ETH_EOA_METHODS)],
                    scopes: [EthScope.Eoa],
                };
            case `${EthAccountType.Erc4337}`:
                return {
                    methods: [...Object.values(ETH_ERC_4337_METHODS)],
                    scopes: [EthScope.Mainnet], // Assuming we are using mainnet for those Smart Accounts.
                };
            case `${BtcAccountType.P2wpkh}`:
                return {
                    methods: [...Object.values(BtcMethod)],
                    scopes: [BtcScope.Mainnet],
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
export const createExpectedInternalAccount = (args) => {
    return createMockInternalAccount({
        ...args,
        importTime: expect.any(Number),
        lastSelected: expect.any(Number),
    });
};
export const createMockInternalAccountOptions = (keyringIndex, keyringType, groupIndex) => {
    if (keyringType === KeyringTypes.hd) {
        const entropySource = `mock-keyring-id-${keyringIndex}`;
        const derivationPath = `m/44'/60'/0'/0/${groupIndex}`;
        return {
            entropySource,
            derivationPath,
            groupIndex,
            // New `KeyringAccount` typed options:
            entropy: {
                type: KeyringAccountEntropyTypeOption.Mnemonic,
                id: entropySource,
                derivationPath,
                groupIndex,
            },
        };
    }
    return {};
};
//# sourceMappingURL=mocks.mjs.map