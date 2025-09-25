import { BtcMethod, EthMethod } from "@metamask/keyring-api";
import type { CaipChainId, KeyringAccount, KeyringAccountType } from "@metamask/keyring-api";
import { KeyringTypes } from "@metamask/keyring-controller";
import type { InternalAccount } from "@metamask/keyring-internal-api";
export declare const ETH_EOA_METHODS: readonly [EthMethod.PersonalSign, EthMethod.Sign, EthMethod.SignTransaction, EthMethod.SignTypedDataV1, EthMethod.SignTypedDataV3, EthMethod.SignTypedDataV4];
export declare const ETH_ERC_4337_METHODS: readonly [EthMethod.PatchUserOperation, EthMethod.PrepareUserOperation, EthMethod.SignUserOperation];
export declare const createMockInternalAccount: ({ id, address, type, name, keyringType, snap, methods, scopes, importTime, lastSelected, options, }?: {
    id?: string | undefined;
    address?: string | undefined;
    type?: KeyringAccountType | undefined;
    name?: string | undefined;
    keyringType?: KeyringTypes | undefined;
    scopes?: `${string}:${string}`[] | undefined;
    methods?: (EthMethod | BtcMethod)[] | undefined;
    snap?: {
        id: string;
        enabled: boolean;
        name: string;
    } | undefined;
    importTime?: number | undefined;
    lastSelected?: number | undefined;
    options?: Record<string, unknown> | undefined;
}) => InternalAccount;
export declare const createExpectedInternalAccount: (args: Parameters<typeof createMockInternalAccount>[0]) => {
    type: "eip155:eoa" | "eip155:erc4337" | "bip122:p2pkh" | "bip122:p2sh" | "bip122:p2wpkh" | "bip122:p2tr" | "solana:data-account" | "tron:eoa" | "any:account";
    id: string;
    options: Record<string, import("@metamask/utils").Json> & {
        entropy?: {
            type: "mnemonic";
            id: string;
            derivationPath: string;
            groupIndex: number;
        } | {
            type: "private-key";
        } | undefined;
        exportable?: boolean | undefined;
    };
    metadata: {
        name: string;
        importTime: number;
        keyring: {
            type: string;
        };
        nameLastUpdatedAt?: number | undefined;
        snap?: {
            name: string;
            id: string;
            enabled: boolean;
        } | undefined;
        lastSelected?: number | undefined;
    };
    address: string;
    scopes: `${string}:${string}`[];
    methods: string[];
};
export declare const createMockInternalAccountOptions: (keyringIndex: number, keyringType: KeyringTypes, groupIndex: number) => KeyringAccount['options'];
//# sourceMappingURL=mocks.d.mts.map