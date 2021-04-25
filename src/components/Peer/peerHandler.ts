import { IBlockProps } from '../Block/Block';
import { createHashASync } from '../AddBlockForm/createBlock';
import {
    REQUEST_CHAIN,
    BLOCK
} from './constants';

interface IContextProps {
    peers: Array<IPeerHandler>
    chains: Array<Array<IBlockProps>>,
    setPeerChain: Function,
    addBlockToChain: Function,
    addChain: Function,
    replaceChain: Function
}

export interface IPeerHandler {
    processMessage: Function,
    requestLatestBlock: Function,
    connectToPeer: Function,
    disconnectPeer: Function,
    getConnectedPeers: Function,
    sendBlockToPeers: Function
}

export const peerHandler = (index: number): IPeerHandler => {
    let _connectedPeers: Array<number> = [];

    const processMessage = ({event, msg}: {event: string, msg: any}): void => {
        switch(event) {
            case BLOCK:
                processRecievedBlock({...msg});
                break;
            case REQUEST_CHAIN:
                processRecievedChain({...msg});
                break;
            default:
                break;
        }
    }

    const getConnectedPeers = (): Array<number> => {
        return _connectedPeers;
    }

    const connectToPeer = ({appContext, peerIndex}: {appContext: IContextProps, peerIndex: number}) => {
        if(!_connectedPeers.includes(peerIndex)) {
            _connectedPeers.push(peerIndex);
            // tell other peer to connect to this one as well to form a 2 way connection
            appContext.peers[peerIndex].connectToPeer({ appContext, peerIndex: index });
            //request the latest block from the peer we connected to
            appContext.peers[peerIndex].requestLatestBlock({appContext, peerIndex: index});
        }
    }

    const disconnectPeer = ({peer, appContext}: {peer: number, appContext: IContextProps}) => {
        if(_connectedPeers.includes(peer)) {
            _connectedPeers.splice(_connectedPeers.indexOf(peer), 1);
            // tell the other peer to disconnect from this peer as well
            appContext.peers[peer].disconnectPeer({peer: index, appContext});
        }
    }

    const requestLatestBlock = ({appContext, peerIndex}: {appContext: IContextProps, peerIndex: number}): void => {
        let chain = appContext.chains[index];
        //sends the peers latest block to connected peer
        appContext.peers[peerIndex].processMessage({event: BLOCK, msg: { block: chain[chain.length-1], chain, appContext }});
    }

    const processRecievedBlock = ({ block, chain, appContext}: {block: IBlockProps, chain: Array<IBlockProps>, appContext: IContextProps}): void => {
        //grab this peers latest block
        let latestBlock = appContext.chains[index][appContext.chains[index].length-1];
        let newBlock = block;
        if(newBlock.hash.slice(0,3) !== "000")
            return;
        if(newBlock.index > 0) {
            if(newBlock.prevHash.slice(0,3) !== "000")
                return;
        }
        if(newBlock.index <= latestBlock.index) {
            // new block index is not greater than latest block, do nothing
            return;
        } else if(newBlock.prevHash === latestBlock.hash) {
            // the new blocks hash is equal to the latest blocks hash, the peer is one block ahead
            // append new block to the chain and tell all connected peers to do the same
            appContext.addBlockToChain(newBlock, index);
            sendBlockToPeers({ block, appContext, chain });
            return;
        } else {
            // this peer is multiple blocks behind, request the entire chain and tell connected peers to do the same
            processRecievedChain({ chain, appContext });
            _connectedPeers.forEach(p => appContext.peers[p].processMessage({ event: REQUEST_CHAIN, msg: { chain, appContext }}));
            return;
        }
    }

    const processRecievedChain = ({chain, appContext}: {chain: Array<IBlockProps>, appContext: IContextProps}): void => {
        let newChain = chain.sort((block1, block2) => (block1.index - block2.index));
        if(newChain.length >= appContext.chains[index].length && isChainValid({ chain, appContext })) {
            appContext.replaceChain(index, newChain);
        }
    }

    const isChainValid = ({chain, appContext}: {chain: Array<IBlockProps>, appContext: IContextProps}): boolean => {
        // is the new chains genesis block valid
        let prevBlock = chain[0];
        if(!isHashValid(appContext.chains[index][0].hash, prevBlock)) {
            // new chain genesis block is invalid, return false
            console.log('invalid chain')
            return false;
        }

        for(const block of chain) {
            if(block.prevHash !== prevBlock.hash && block.index !== 0) {
                // if this is not the genesis block and it's prevhash is not equal to the prevblocks hash,
                // then return false
                return false;
            } else if(block.hash.slice(0, 3) !== "000") {
                // this blocks hash does not begin with "000" it is invalid, return false
                return false;
            } else {
                // all checks have passed, set prevBlock to this block and continue
                prevBlock = block;
            }
        }
        // the chain is valid, return true
        return true;
    }

    const isHashValid = (hash: string, prevBlock: IBlockProps): boolean => {
        let prevBlockHash = createHashASync(prevBlock);
        return prevBlockHash === hash;
    }

    const sendBlockToPeers = ({block, appContext, chain}: {block: IBlockProps, appContext: IContextProps, chain: Array<IBlockProps>}) => {
        _connectedPeers.forEach(p => {
            appContext.peers[p].processMessage({event: BLOCK, msg: { block, chain, appContext }});
        });
    }

    return {
        processMessage,
        requestLatestBlock,
        connectToPeer,
        disconnectPeer,
        sendBlockToPeers,
        getConnectedPeers
    }
}