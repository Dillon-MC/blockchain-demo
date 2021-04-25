import './AddBlockForm.css';
import { useAppContext } from '../../containers/App';
import { createBlock } from './createBlock';
import { useState } from 'react';

interface IAddBlockFormProps {
    selectedPeer: number
}

const AddBlockForm = ({selectedPeer}: IAddBlockFormProps): JSX.Element => {
    const appContext = useAppContext();
    const [blockdata, setBlockdata] = useState<string>('');
    
    const addBlock = (): void => {
        createBlock({
            index: appContext.chains[selectedPeer].length, 
            data: blockdata, 
            prevBlock: appContext.chains[selectedPeer][appContext.chains[selectedPeer].length-1]
        }).then(newBlock => {
            appContext.addBlockToChain(newBlock, selectedPeer);
            appContext.peers[selectedPeer].sendBlockToPeers({ block: newBlock, appContext, chain: appContext.chains[selectedPeer] });
            return;
        });
    }

    return (
        <div className="addblockform">
            <div className="container">
                <input className="blockdatainput" type="text" 
                    placeholder={`BLOCK #${appContext.chains[selectedPeer].length}`} onChange={(e) => {setBlockdata(e.target.value)}}/>

                <button id="addblockbtn" onClick={addBlock}>
                        Add Block
                </button>
            </div>
        </div>
    );
}

export default AddBlockForm;