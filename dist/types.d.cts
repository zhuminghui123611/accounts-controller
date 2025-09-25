import type { CaipChainId } from "@metamask/keyring-api";
import type { NetworkClientId } from "@metamask/network-controller";
export type MultichainNetworkControllerNetworkDidChangeEvent = {
    type: `MultichainNetworkController:networkDidChange`;
    payload: [NetworkClientId | CaipChainId];
};
//# sourceMappingURL=types.d.cts.map