import { IBlockProps } from '../components/Block/Block';
import { peerHandler, IPeerHandler } from '../components/Peer/peerHandler';
import { createContext, useContext } from 'react';

export interface IContextProps {
    refreshes: number,
    peers: Array<IPeerHandler>,
    chains: Array<Array<IBlockProps>>,
    setRefreshes: Function,
    setPeerChain: Function,
    addBlockToChain: Function,
    addChain: Function,
    replaceChain: Function
}
  
const stateContext: IContextProps = {
    refreshes: 0,
    peers: [peerHandler(0)],
    chains: [[]],
    setRefreshes: (v: number): void => {},
    setPeerChain: (peerIndex: number, chain: Array<IBlockProps>): void => {},
    addBlockToChain: (peerIndex: number, block: IBlockProps): void => {},
    addChain: (): void => {},
    replaceChain: (chain: Array<IBlockProps>, newChain: Array<IBlockProps>): void => {}
}
  
export const AppContext = createContext(stateContext);

export const useAppContext = (): IContextProps => {
    return useContext(AppContext);
}