import './Block.css';
import { useAppContext } from '../../containers/Context';
import crypto from 'crypto';
import { createHashSync } from '../AddBlockForm/createBlock';

export interface IBlockProps {
    index: number,
    nonce: number,
    data: string,
    timestamp: string,
    prevHash: string,
    hash: string
}

const Block = ({blockData, selectedPeer}: {blockData: IBlockProps, selectedPeer: number}): JSX.Element => {
    const appContext = useAppContext();

    // changes the blocks hash
    const changeHash = (block: IBlockProps): string => {
        appContext.setRefreshes(appContext.refreshes++);
        return crypto.createHash('SHA256').update(
            block.index+
            block.timestamp+
            `${block.data}`+
            block.prevHash+
            block.nonce
        ).digest('hex');
    }

    // update the block when it is changed
    const updateBlock = (data: string): void => {
        let block = appContext.chains[selectedPeer][blockData.index];
        block.data = data;
        // update the blocks hash when the data is changed
        block.hash = changeHash(block);
        // refresh block when changes are made
        appContext.setRefreshes(appContext.refreshes++);
        updatePrecedingBlockHashes();
    }

    const isHashValid = (): boolean => {
        if(blockData.hash.slice(0,3) !== "000") {
            return false;
        }
        return true;
    }

    const isPrevHashValid = (): boolean => {
        if(blockData.prevHash.slice(0,3) !== "000" && blockData.index > 0) {
            return false;
        }
        return true;
    }

    //re-mine the block to find a valid hash
    const mineBlock = (): void => {
        createHashSync(blockData)
        .then(newHash => {
            appContext.chains[selectedPeer][blockData.index].hash = newHash;
            appContext.chains[selectedPeer][blockData.index].timestamp = new Date().toUTCString();
            appContext.setRefreshes(appContext.refreshes++);
            // update the hashes of all other blocks in the chain that come after this one
            updatePrecedingBlockHashes();
        });
        appContext.setRefreshes(appContext.refreshes++);
    }

    const updatePrecedingBlockHashes = (): void => {
        // update the hashes of all other blocks in the chain that come after this one
        for(let i = blockData.index+1; i < appContext.chains[selectedPeer].length; i++) {
            let block = appContext.chains[selectedPeer][i];
            if(block.index > 0) {
                block.prevHash = appContext.chains[selectedPeer][i-1].hash;
            }
            block.hash = changeHash(block);
            appContext.setRefreshes(appContext.refreshes++);
        }
    }

    return (
        <div className="block">
            <span className="blockheader">
                <h4>{`INDEX: #${blockData.index}`}</h4>
                <h5>{blockData.nonce}</h5>
            </span>
            <input className="blockdatainput" name={"blockdatainput"} type="text" value={blockData.data} onChange={(e) => updateBlock(e.target.value)}/>
            <div className="hashcontainer">
                <h6>PREVIOUS HASH</h6>
                <div className="prevhash hash" style={
                    // if the previous hash is invalid change the colors to red
                    isPrevHashValid() ? {color:'rgb(62, 238, 120)', borderColor:'rgb(62, 238, 120)', backgroundColor:'rgb(181, 241, 201)'}
                    :
                    {color:'red', borderColor:'rgb(238, 62, 62)', backgroundColor:'rgb(241, 181, 181)'}
                }>
                    {blockData.prevHash}
                </div>
                <h6>HASH</h6>
                <div className="hash" style={
                    // if the hash is invalid change the colors to red
                    isHashValid() ? {color:'rgb(62, 238, 120)', borderColor:'rgb(62, 238, 120)', backgroundColor:'rgb(181, 241, 201)'}
                    :
                    {color:'red', borderColor:'rgb(238, 62, 62)', backgroundColor:'rgb(241, 181, 181)'}
                }>
                    {blockData.hash}
                </div>
            </div>

            {/* display button to mine block if the hash is invalid */}
            {!isHashValid() &&
            <span className="material-icons mineblockbtn" onClick={mineBlock}>
                <div className="tooltip">MINE</div>
                build_circle
            </span>}
            
            <footer>{blockData.timestamp}</footer>
        </div>
    );
}

export default Block;