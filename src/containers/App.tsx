import './App.css';
import { useEffect, lazy, Suspense } from 'react';
import { IBlockProps } from '../components/Block/Block';
import Chain from '../components/Chain/Chain';
import Peer from '../components/Peer/Peer';
import PeerList from '../components/PeerList/PeerList';
import { useState } from 'react';
import { peerHandler, IPeerHandler } from '../components/Peer/peerHandler';
import { useAppContext, AppContext } from './Context';
import { createBlock } from '../components/AddBlockForm/createBlock';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const Block = lazy(() => import('../components/Block/Block'));
const AddPeerBtn = lazy(() => import('../components/AddPeerBtn/AddPeerBtn'));
const AddBlockForm = lazy(() => import('../components/AddBlockForm/AddBlockForm'));

function App() {
  const [refreshes, setRefreshes] = useState<number>(useAppContext().refreshes);

  const createGenesisBlock = async (): Promise<IBlockProps> => {
    return createBlock({ index: 0, data: 'genesis block', prevBlock: null })
    .then((block: IBlockProps) =>  block);
  }

  //when a peer adds a block to its chain, all connected peers will create a copy of that block to add to their own chain
  const createBlockCopy = (block: IBlockProps): IBlockProps => {
    return {
      index: block.index,
      nonce: block.nonce,
      data: `${block.data}`,
      timestamp: new Date().toUTCString(),
      prevHash: `${block.prevHash}`,
      hash: `${block.hash}`
    }
  }

  const [peers, addPeer] = useState<Array<IPeerHandler>>([peerHandler(0)]);
  const [selectedPeer, setSelectedPeer] = useState<number>(0);
  const [chains, setChains] = useState<Array<Array<IBlockProps>>>([[]]);

  const [currentChain, setCurrentChain] = useState<Array<IBlockProps>>(chains[0]);

  useEffect(() => {
    createGenesisBlock().then(genesisBlock => {
      setChains([[genesisBlock]])
      setCurrentChain([genesisBlock]);
    });
  },[])

  const setPeerChain = (peerIndex: number, chain: Array<IBlockProps>): void => {
    chains[peerIndex] = chain;
  }

  // adds the given block to the peers chain
  const addBlockToChain = (block: IBlockProps, peer: number): void => {
    const blockCopy = createBlockCopy(block);
    chains[peer] = [...chains[peer], blockCopy];
    peer === selectedPeer && setCurrentChain([...currentChain, blockCopy]);
  }

  const addChain = (): void => {
    createGenesisBlock().then(genesisBlock => setChains([...chains, [genesisBlock]]));
  }

  const replaceChain = (chainIndex: number, newChain: Array<IBlockProps>): void => {
    chains[chainIndex] = [];
    newChain.forEach(block => {
      chains[chainIndex].push(createBlockCopy(block));
    });
    setCurrentChain(newChain);
  }

  return (
    <div className="App">
      <AppContext.Provider value={{ refreshes, setRefreshes, peers, chains, setPeerChain, addBlockToChain, addChain, replaceChain }}>
        <PeerList>
          {peers.map((peer, index) => {
            return <Peer peerIndex={index} selectedPeer={selectedPeer} selectPeer={setSelectedPeer} setCurrentChain={setCurrentChain} key={`p${index}`} />
          })}
        </PeerList>
        <Suspense fallback={<Skeleton width={300} height={180} />}>
          <AddBlockForm selectedPeer={selectedPeer}/>
        </Suspense>

        <Suspense fallback={<Skeleton width={50} height={50} />}>
          <AddPeerBtn addPeer={()=>{ addPeer([...peers, peerHandler(peers.length)]) }}/>
        </Suspense>
        <Chain>
          <Suspense fallback={<Skeleton width={500} height={260} />}>
            {currentChain && currentChain.map(block => <Block blockData={block} selectedPeer={selectedPeer} key={block.index+selectedPeer}/>)}
          </Suspense>
        </Chain>
      </AppContext.Provider>
    </div>
  );
}

export default App;
