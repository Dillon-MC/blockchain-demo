import { useEffect, useState } from 'react';
import './Peer.css';
import { useAppContext } from '../../containers/App';
import { uniqueNamesGenerator, Config, names } from 'unique-names-generator';

const config: Config = {
    dictionaries: [names]
}

export interface IPeerProps {
    peerIndex: number,
    selectedPeer: number,
    selectPeer: Function,
    setCurrentChain: Function
}

const Peer = ({selectedPeer, peerIndex, selectPeer, setCurrentChain }: IPeerProps): JSX.Element => {
    const [peerName, setPeerName] = useState<string>('');
    useEffect(() => {
        setPeerName(uniqueNamesGenerator(config));
    },[])

    const [isSelectedPeer, setIsSelectedPeer] = useState<boolean>(false);
    //causes the component to re-render
    const [shouldUpdate, update] = useState<number>(0);
    const appContext = useAppContext();
    const index = peerIndex;

    useEffect(() => {
        setIsSelectedPeer(selectedPeer === index ? true : false);
    },[selectedPeer,shouldUpdate]);

    const setAsSelectedPeer = (): void => {
        console.log(appContext.chains[index]);
        selectPeer(index);
        setCurrentChain(appContext.chains[index]);
    }

    return (
        <div className="peer" onClick={setAsSelectedPeer}>
            {!isSelectedPeer ? appContext.peers[index].getConnectedPeers().includes(selectedPeer) ? 
                <span className="material-icons toggleconnectIcon" onClick={(e) => {
                    appContext.peers[index].disconnectPeer({ peer: selectedPeer, appContext });
                    update(shouldUpdate === 0 ? 1 : 0);
                    e.stopPropagation();
                }}>
                    link_off
                </span>
            :
                <span onClick={(e) => {
                        appContext.peers[index].connectToPeer({ appContext, peerIndex: selectedPeer });
                        update(shouldUpdate === 0 ? 1 : 0);
                        e.stopPropagation();
                    }} className="material-icons toggleconnectIcon">
                    cable
                </span>
            : null}

            <span className="material-icons peerIcon" style={     
                isSelectedPeer ? {color: 'darkgray'} 
                : 
                appContext.peers[index].getConnectedPeers().includes(selectedPeer) ? {color: 'rgb(20, 230,  120)'}
                :
                {color: 'rgb(71, 135, 255)'}
            }>
                account_circle
            </span>
            <div>{peerName}</div>
        </div>
    );
}

export default Peer;